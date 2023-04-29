data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["codebuild.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "codebuild-role" {
  name               = "${var.env}-${var.name}-codebuild-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

data "aws_iam_policy_document" "policy" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:DescribeDhcpOptions",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DeleteNetworkInterface",
      "ec2:DescribeSubnets",
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeVpcs",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "AllowPush"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:CompleteLayerUpload",
      "ecr:GetAuthorizationToken",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "policy" {
  role   = aws_iam_role.codebuild-role.name
  policy = data.aws_iam_policy_document.policy.json
}

data "aws_caller_identity" "current" {}

resource "aws_codebuild_project" "build" {
  name          = "${var.env}-${var.name}"
  service_role  = aws_iam_role.codebuild-role.arn
  build_timeout = 5

  source {
    type                = "GITHUB"
    report_build_status = true
    location            = "https://github.com/${var.reponame}.git"
    git_clone_depth     = 1
  }

  artifacts {
    type = "NO_ARTIFACTS"
  }

  environment {
    compute_type    = "BUILD_GENERAL1_SMALL"
    type            = "ARM_CONTAINER"
    image           = "aws/codebuild/amazonlinux2-aarch64-standard:3.0"
    privileged_mode = true

    environment_variable {
      name  = "AWS_DEFAULT_REGION"
      value = var.aws_region
    }

    environment_variable {
      name  = "AWS_ACCOUNT_ID"
      value = data.aws_caller_identity.current.account_id
    }

    environment_variable {
      name  = "IMAGE_REPO_NAME"
      value = var.repository_name
    }

    environment_variable {
      name  = "IMAGE_TAG"
      value = "latest"
    }
  }
}

resource "aws_codebuild_source_credential" "github_creds" {
  auth_type   = "PERSONAL_ACCESS_TOKEN"
  server_type = "GITHUB"
  token       = var.github_token
}
