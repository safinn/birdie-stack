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
  max_size           = 1
  min_size           = 1
  capacity_rebalance = true

  vpc_zone_identifier = var.subnet_ids

  launch_template {
    id      = aws_launch_template.lt.id
    version = "$Latest"
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

resource "aws_key_pair" "deployer" {
  key_name   = "deployer-key"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC/9NGCRPY3eSDDj+j94RaIDYhRiMZYkG9MYyT3VqR3L7+wl3Gm+D0i7L27r+Df4msXBd+f6eR4J8A7bvbpcLmscT1BjIOFpsvistn0+jpmIFjoNsGKOwuJUVBRR6/mBJAK85Jn/ZmCJ+ajo+qMnOJgIFzp/k6ht/bN7iktFfceGSjukVmMD9mm+DtItu6zFhx1hJn0lh1+OwkxfM13KBrNcwMTPBYo+jBu2CevVmebDYTcrHoBmOXGCJ6t9bSlZn78JBvTxZtC3BilCIffoghg0X93Aku4IhjtnYwnG2A3qsF/K3HFfJDonPl0GNNJgnEUsUzTHQy5+yW2UlozJftbcgMX/xVWFsIJU2ikYKriEhHyxs/9Flt/4TEdzz3vBvlK+043AJOJ4yYMn44B4b+2DDX13r+GUkmhIvKtKHDF2zMZSCkuNBX00szhiz5oTuezExvx5YTFmvQm5+QU90G4VLQIDCSEfeE9ago/yMrzRxSLK4TD71WcZjbXZA49qFpPZqQ07QEJMop8bSLl28DkMvLysaeg3NAzDiWh8mlFHjc2WaErboAF+Rk4w+krgEpKJyI0RyoEJGXY9j+OT5cDbcRzHuE7f+9TFTem/TQoMTjrUARgbfXFkaJ6L+w42DWxHAgfgHrLFZnqVSR+mAox4u0CsIOYKVQEtAMFjhG9iw== dimitris13k@gmail.com"
}

resource "aws_launch_template" "lt" {
  image_id      = data.aws_ssm_parameter.ecs_ami_arm64.value
  instance_type = "t4g.nano"
  key_name      = "deployer-key"

  user_data = base64encode(templatefile("${path.module}/user_data.tpl", {
    ecs_cluster_name = aws_ecs_cluster.ecs.name
    domain           = var.domain
  }))

  network_interfaces {
    associate_public_ip_address = true
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
    # managed_termination_protection = "ENABLED"
  }
}
