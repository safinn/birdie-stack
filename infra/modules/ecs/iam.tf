data "aws_iam_policy_document" "ec2_instance_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2_instance_role" {
  name               = "${var.env}-${var.name}-ec2-instance-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_instance_assume_role_policy.json
}

resource "aws_iam_instance_profile" "ecs_node" {
  name = "${var.env}-${var.name}-node-instance-profile"
  role = aws_iam_role.ec2_instance_role.name
}

resource "aws_iam_role_policy_attachment" "ecs_instance_role" {
  role       = aws_iam_role.ec2_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

// Allow updating DNS

resource "aws_iam_policy" "policy" {
  name        = "ec2_boot_update_dns"
  path        = "/"
  description = "Updates the DNS when the EC2 instance launches"

  policy = data.aws_iam_policy_document.dns.json
}

data "aws_iam_policy_document" "dns" {
  statement {
    actions   = ["route53:ListHostedZonesByName"]
    resources = ["*"]
    effect    = "Allow"
  }

  statement {
    actions   = ["route53:ChangeResourceRecordSets"]
    resources = [var.hosted_zone_arn]
    effect    = "Allow"
  }
}

resource "aws_iam_role_policy_attachment" "dns" {
  role       = aws_iam_role.ec2_instance_role.name
  policy_arn = aws_iam_policy.policy.arn
}

// Task execution role

data "aws_iam_policy_document" "ecs_task_execution_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "${var.env}-${var.name}-task-execution-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_role_policy.json
}

resource "aws_iam_role_policy_attachment" "default_task_execution_role" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

// Task role

data "aws_iam_policy_document" "ecs_task_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_task_role" {
  name               = "${var.env}-${var.name}-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_role_policy.json
}

data "aws_iam_policy_document" "task_policy_document" {
  statement {
    actions   = ["logs:CreateLogGroup"]
    resources = ["*"]
  }

  dynamic "statement" {
    for_each = var.domain_identity_arn == "" ? [] : [1]
    content {
      actions   = ["ses:SendEmail", "ses:SendRawEmail"]
      resources = [var.domain_identity_arn]
    }
  }

  statement {
    sid       = "GetSecretValue"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [var.db_password_secret_arn == "" ? "*" : var.db_password_secret_arn]
  }

  # dynamic "statement" {
  #   for_each = var.db_password_secret_arn == "" ? [] : [1]
  #   content {
  #     actions   = ["secretsmanager:GetSecretValue"]
  #     resources = [var.db_password_secret_arn]
  #   }
  # }
}

resource "aws_iam_role_policy" "task_policy" {
  policy = data.aws_iam_policy_document.task_policy_document.json
  role   = aws_iam_role.ecs_task_role.id
}
