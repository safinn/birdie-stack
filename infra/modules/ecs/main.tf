resource "aws_ecs_cluster" "ecs" {
  name = "${var.env}-${var.name}-ecs-cluster"
}

resource "aws_ecs_cluster_capacity_providers" "this" {
  cluster_name = aws_ecs_cluster.ecs.name

  capacity_providers = [aws_ecs_capacity_provider.this.name]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = aws_ecs_capacity_provider.this.name
  }
}

resource "aws_autoscaling_group" "this" {
  name               = "${var.env}-${var.name}-asg"
  min_size           = var.min_instances
  max_size           = var.simple ? 1 : var.max_instances
  capacity_rebalance = true

  vpc_zone_identifier = var.simple ? var.public_subnet_ids : var.private_subnet_ids

  launch_template {
    id      = aws_launch_template.lt.id
    version = "$Latest"
  }

  lifecycle {
    create_before_destroy = true
    ignore_changes        = [desired_capacity]
  }

  tag {
    key                 = "AmazonECSManaged"
    value               = true
    propagate_at_launch = true
  }
}

data "aws_ssm_parameter" "ecs_ami_arm64" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2/arm64/recommended/image_id"
}

resource "aws_launch_template" "lt" {
  image_id      = data.aws_ssm_parameter.ecs_ami_arm64.value
  instance_type = var.ec2_instance_type

  user_data = base64encode(templatefile("${path.module}/user_data.tpl", {
    ecs_cluster_name = aws_ecs_cluster.ecs.name
    domain           = var.domain
    simple           = var.simple
  }))

  network_interfaces {
    associate_public_ip_address = var.simple ? true : false
    delete_on_termination       = true
    security_groups             = [var.security_group]
  }

  iam_instance_profile {
    name = aws_iam_instance_profile.ecs_node.name
  }
}

resource "aws_ecs_capacity_provider" "this" {
  name = "${var.env}-${var.name}-cp"

  auto_scaling_group_provider {
    auto_scaling_group_arn = aws_autoscaling_group.this.arn

    managed_scaling {
      status = "ENABLED"
    }
  }
}
