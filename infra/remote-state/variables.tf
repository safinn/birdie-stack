variable "name" {
  description = "Name to be used on all the resources as identifier"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "reponame" {
  description = "The repo name used to create a role for GitHub actions"
  type        = string
}
