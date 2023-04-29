variable "name" {
  description = "Name to be used on all the resources as identifier"
  type        = string
  default     = ""
}

variable "env" {
  description = "The application environment"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "reponame" {
  description = "The repo name used to create a role for GitHub actions including user/org name"
  type        = string
}

variable "repository_name" {
  description = "The ecr repository name used to hold the docker images"
  type        = string
}

variable "github_token" {
  description = "The github personal access token used by codebuild to access the source"
  type        = string
  sensitive   = true
}
