variable "create_vpc" {
  description = "Controls if VPC should be created."
  type        = bool
  default     = true
}

variable "name" {
  description = "Name to be used on all the resources as identifier."
  type        = string
}

variable "env" {
  description = "The application environment."
  type        = string
}

variable "reponame" {
  description = "The repo name used to create a role for GitHub actions (e.g. safinn/birdie-stack)."
  type        = string
  nullable    = false
}

variable "aws_region" {
  description = "AWS region."
  type        = string
  default     = "eu-west-1"
}

variable "allocated_storage" {
  description = "The allocated storage in gigabytes."
  type        = number
  default     = 5
}

variable "instance_class" {
  description = "The instance type of the RDS instance."
  type        = string
  default     = "db.t4g.micro"
}

variable "domain" {
  description = "The domain used to create a route 53 zone and ses domain sending identity."
  type        = string
  nullable    = false
}

variable "github_token" {
  description = "The github personal access token used by codebuild to access the source."
  type        = string
  sensitive   = true
  nullable    = false
}

variable "ec2_instance_type" {
  description = "The instance type to use for EC2 instances."
  type        = string
  default     = "t4g.micro"
}

variable "min_instances" {
  description = "Minimum number of ec2 instances the ECS cluster should scale in to."
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of ec2 instances the ECS cluster should scale up to. Ignored in simple deployment."
  type        = number
  default     = 1
}

variable "simple" {
  description = "Simple single instance, nonscalable cheap deployment."
  type        = bool
  default     = true
}

variable "app_instance_count" {
  description = "Number of instances of the application to run. Ignored in simple deployment."
  type        = number
  default     = 1
}
