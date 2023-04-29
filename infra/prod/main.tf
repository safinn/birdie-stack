locals {
  site_domain_name_parts = split(".", var.domain)
  parent_domain          = join(".", slice(local.site_domain_name_parts, length(local.site_domain_name_parts) - 2, length(local.site_domain_name_parts)))
}

module "oidc" {
  source   = "../modules/oidc"
  reponame = var.reponame
}

module "network" {
  source = "../modules/network"
  name   = var.name
  env    = var.env
}

module "dns" {
  source = "../modules/dns"
  domain = local.parent_domain
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

  name            = var.name
  env             = var.env
  subnet_ids      = module.network.public_subnet_ids
  security_group  = module.sg.ecs_sg_id
  domain          = var.domain
  hosted_zone_arn = module.dns.route53_zone_arn
  # domain_identity_arn    = module.ses.domain_identity_arn
  # db_password_secret_arn = module.rds.db_password_secret_arn
}

module "sg" {
  source = "../modules/security"

  name = var.name
  env  = var.env

  vpc_id = module.network.vpc_id
}

# module "rds" {
#   source = "../modules/rds"

#   name = var.name
#   env  = var.env

#   subnet_ids     = module.network.private_subnet_ids
#   security_group = module.sg.rds_sg_id
# }

module "nginx-proxy" {
  source         = "../modules/container-definition"
  name           = "nginx-proxy"
  env            = var.env
  external_image = "nginxproxy/nginx-proxy:alpine"
  memory         = 64

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
  source         = "../modules/container-definition"
  name           = "acme-companion"
  env            = var.env
  external_image = "nginxproxy/acme-companion"
  memory         = 64

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
  source                     = "../modules/service"
  name                       = "nginx-proxy-acme-companion"
  env                        = var.env
  ecs_cluster_id             = module.ecs.ecs_cluster_id
  deployment_maximum_percent = 100

  container_definitions = [module.nginx-proxy.container_definition, module.acme-companion.container_definition]

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

module "service-td" {
  source = "../modules/container-definition"
  name   = var.name
  env    = var.env

  # portMappings = [
  #   {
  #     containerPort = 8000
  #   }
  # ]

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
      "name"  = "NAME"
      "value" = var.name
    },
    {
      "name"  = "ENV"
      "value" = var.env
    },
    # {
    #   "name"  = "DATABASE_HOST"
    #   "value" = module.rds.host
    # },
    # {
    #   "name"  = "DATABASE_PORT"
    #   "value" = module.rds.port
    # },
    # {
    #   "name"  = "DATABASE_DB"
    #   "value" = module.rds.database
    # },
    # {
    #   "name"  = "DATABASE_USERNAME"
    #   "value" = module.rds.username
    # }
  ]

  healthCheckCommand = ["CMD-SHELL", "curl -f http://localhost:8000/healthcheck || exit 1"]
}

module "service" {
  source                = "../modules/service"
  name                  = var.name
  env                   = var.env
  ecs_cluster_id        = module.ecs.ecs_cluster_id
  container_definitions = [module.service-td.container_definition]
}
