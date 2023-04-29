resource "aws_ecs_service" "service" {
  name                       = var.name
  cluster                    = var.ecs_cluster_id
  task_definition            = aws_ecs_task_definition.task.arn
  desired_count              = 1
  deployment_maximum_percent = 200
}

resource "aws_ecs_task_definition" "task" {
  family                = "${var.env}-${var.name}-task"
  container_definitions = jsonencode(var.container_definitions)

  dynamic "volume" {
    for_each = var.volumes

    content {
      name      = volume.value["name"]
      host_path = volume.value["host_path"]
    }
  }

  network_mode = "bridge"
}
