resource "aws_ecs_service" "service" {
  name                       = var.name
  cluster                    = var.ecs_cluster_id
  task_definition            = aws_ecs_task_definition.task.arn
  desired_count              = var.simple ? 1 : var.app_instance_count
  deployment_maximum_percent = 200

  capacity_provider_strategy {
    capacity_provider = var.capacity_provider_name
    weight            = 1
  }

  dynamic "load_balancer" {
    for_each = var.target_group_arn == null ? [] : [var.target_group_arn]
    content {
      target_group_arn = var.target_group_arn
      container_name   = "${var.env}-${var.name}-task"
      container_port   = 8000
    }
  }
}

resource "aws_ecs_task_definition" "task" {
  family                = "${var.env}-${var.name}-task"
  container_definitions = jsonencode(var.container_definitions)
  execution_role_arn    = var.task_execution_role_arn
  task_role_arn         = var.task_role_arn

  dynamic "volume" {
    for_each = var.volumes

    content {
      name      = volume.value["name"]
      host_path = volume.value["host_path"]
    }
  }

  network_mode = "bridge"
}
