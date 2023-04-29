data "aws_region" "current" {}

resource "aws_ecr_repository" "image" {
  count = var.external_image == "" ? 1 : 0
  name  = "${var.env}-${var.name}-ecr"
}

resource "aws_cloudwatch_log_group" "main" {
  name = "${var.env}-${var.name}"
}

locals {
  container_definition = {
    name              = "${var.env}-${var.name}-task"
    image             = var.external_image == "" ? aws_ecr_repository.image[0].repository_url : var.external_image
    memoryReservation = var.memory
    mountPoints       = var.mountPoints
    portMappings      = var.portMappings
    dockerLabels      = var.labels
    dependsOn         = var.dependsOn
    volumesFrom       = var.volumesFrom
    environment = concat(
      [
        {
          "name"  = "ENV"
          "value" = var.env
        }
      ],
      var.env_vars
    )

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"  = "${var.env}-${var.name}"
        "awslogs-region" = data.aws_region.current.name
      }
    }

    healthcheck = {
      command  = var.healthCheckCommand
      interval = 10
    }
  }
}
