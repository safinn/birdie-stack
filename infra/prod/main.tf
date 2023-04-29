locals {
  site_domain_name_parts = split(".", var.domain)
  parent_domain          = join(".", slice(local.site_domain_name_parts, length(local.site_domain_name_parts) - 2, length(local.site_domain_name_parts)))
}

data "aws_ec2_instance_type" "this" {
  instance_type = var.ec2_instance_type
}

module "codebuild" {
  count           = contains(data.aws_ec2_instance_type.this.supported_architectures, "arm64") ? 1 : 0
  source          = "../modules/codebuild"
  name            = var.name
  env             = var.env
  aws_region      = var.aws_region
  reponame        = var.reponame
  repository_name = module.service-td.ecr_repository_name
  github_token    = var.github_token
}

module "network" {
  source = "../modules/network"
  name   = var.name
  env    = var.env
  simple = var.simple
}

module "dns" {
  source = "../modules/dns"
  domain = local.parent_domain
  simple = var.simple
}

# module "ses" {
#   source = "../modules/ses"

#   name = var.name
#   env  = var.env

#   domain          = local.parent_domain
#   route53_zone_id = module.dns.route53_zone_id
#   email           = "no-reply@${local.parent_domain}"
# }

module "ecs" {
  source = "../modules/ecs"

  name                   = var.name
  env                    = var.env
  public_subnet_ids      = module.network.public_subnet_ids
  private_subnet_ids     = module.network.private_subnet_ids
  security_group         = module.sg.ecs_sg_id
  alb_security_group     = module.sg.alb_sg_id
  domain                 = var.domain
  hosted_zone_arn        = module.dns.route53_zone_arn
  ec2_instance_type      = var.ec2_instance_type
  db_password_secret_arn = module.rds.db_password_secret_arn
  vpc_id                 = module.network.vpc_id
  cert_arn               = module.dns.cert_arn
  min_instances          = var.min_instances
  max_instances          = var.max_instances

  simple = var.simple
  # domain_identity_arn    = module.ses.domain_identity_arn
}

module "sg" {
  source = "../modules/security"

  name   = var.name
  env    = var.env
  simple = var.simple

  vpc_id = module.network.vpc_id
}

module "rds" {
  source = "../modules/rds"

  name = var.name
  env  = var.env

  subnet_ids     = module.network.private_subnet_ids
  security_group = module.sg.rds_sg_id
}

module "nginx-proxy" {
  count          = var.simple ? 1 : 0
  source         = "../modules/container-definition"
  name           = "nginx-proxy"
  env            = var.env
  external_image = "nginxproxy/nginx-proxy:alpine"
  memory         = 192

  env_vars = [
    {
      "name"  = "TRUST_DOWNSTREAM_PROXY"
      "value" = "false"
    }
  ]

  portMappings = [
    {
      containerPort = 80
      hostPort      = 80
    },
    {
      containerPort = 443
      hostPort      = 443
    }
  ]

  mountPoints = [
    {
      "containerPath" = "/tmp/docker.sock:ro"
      "sourceVolume"  = "docker-socket-bind"
    },
    {
      "containerPath" = "/etc/nginx/certs"
      "sourceVolume"  = "certs"
    },
    {
      "containerPath" = "/etc/nginx/vhost.d"
      "sourceVolume"  = "vhost"
    },
    {
      "containerPath" = "/usr/share/nginx/html"
      "sourceVolume"  = "html"
    }
  ]

}

module "acme-companion" {
  count          = var.simple ? 1 : 0
  source         = "../modules/container-definition"
  name           = "acme-companion"
  env            = var.env
  external_image = "nginxproxy/acme-companion"
  memory         = 192

  volumesFrom = [{
    "sourceContainer" = "${var.env}-nginx-proxy-task"
  }]

  dependsOn = [{
    "containerName" = "${var.env}-nginx-proxy-task"
    "condition"     = "START"
  }]

  env_vars = [
    {
      "name"  = "DEFAULT_EMAIL"
      "value" = "info@${local.parent_domain}"
    }
  ]

  mountPoints = [
    {
      "containerPath" = "/var/run/docker.sock:ro"
      "sourceVolume"  = "docker-socket-bind"
    },
    {
      "containerPath" = "/etc/acme.sh"
      "sourceVolume"  = "acme"
    },
    {
      "containerPath" = "/etc/nginx/vhost.d"
      "sourceVolume"  = "vhost"
    },
    {
      "containerPath" = "/etc/nginx/certs"
      "sourceVolume"  = "certs"
    },
    {
      "containerPath" = "/usr/share/nginx/html"
      "sourceVolume"  = "html"
    }
  ]

}

module "nginx-proxy-acme-companion" {
  count                      = var.simple ? 1 : 0
  source                     = "../modules/service"
  name                       = "nginx-proxy-acme-companion"
  env                        = var.env
  ecs_cluster_id             = module.ecs.ecs_cluster_id
  deployment_maximum_percent = 100
  capacity_provider_name     = module.ecs.capacity_provider_name

  container_definitions = [module.nginx-proxy[0].container_definition, module.acme-companion[0].container_definition]

  volumes = [
    {
      name      = "docker-socket-bind"
      host_path = "/var/run/docker.sock"
    },
    {
      name      = "certs"
      host_path = "certs"
    },
    {
      name      = "vhost"
      host_path = "vhost"
    },
    {
      name      = "html"
      host_path = "html"
    },
    {
      name      = "acme"
      host_path = "acme"
    },
  ]
}

resource "random_string" "session_secret" {
  length  = 16
  special = true
}

resource "random_string" "otp_secret" {
  length  = 16
  special = true
}

module "service-td" {
  source = "../modules/container-definition"
  name   = var.name
  env    = var.env
  memory = 256

  portMappings = [
    {
      containerPort = 8000
    }
  ]

  env_vars = [
    {
      "name"  = "PORT"
      "value" = 8000
    },
    {
      "name"  = "VIRTUAL_HOST"
      "value" = var.domain
    },
    {
      "name"  = "LETSENCRYPT_HOST"
      "value" = var.domain
    },
    {
      "name"  = "AWS_REGION"
      "value" = var.aws_region
    },
    {
      "name"  = "APP_NAME"
      "value" = var.name
    },
    {
      "name"  = "PUBLIC_APP_NAME"
      "value" = var.name
    },
    {
      "name"  = "ENV"
      "value" = var.env
    },
    {
      "name"  = "OTP_SECRET"
      "value" = random_string.otp_secret.result
    },
    {
      "name"  = "SESSION_SECRET"
      "value" = random_string.session_secret.result
    },
    {
      "name"  = "DATABASE_HOST"
      "value" = module.rds.host
    },
    {
      "name"  = "DATABASE_PORT"
      "value" = module.rds.port
    },
    {
      "name"  = "DATABASE_DB"
      "value" = module.rds.database
    },
    {
      "name"  = "DATABASE_USERNAME"
      "value" = module.rds.username
    }
  ]

  healthCheckCommand = ["CMD-SHELL", "curl -f localhost:8000/healthcheck || exit 1"]
}

module "service" {
  source                  = "../modules/service"
  name                    = var.name
  env                     = var.env
  ecs_cluster_id          = module.ecs.ecs_cluster_id
  container_definitions   = [module.service-td.container_definition]
  task_execution_role_arn = module.ecs.task_execution_role_arn
  task_role_arn           = module.ecs.task_role_arn
  target_group_arn        = module.ecs.target_group_arn
  capacity_provider_name  = module.ecs.capacity_provider_name
  simple                  = var.simple
  app_instance_count      = var.app_instance_count
}
