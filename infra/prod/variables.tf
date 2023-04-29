variable "create_vpc" {
  description = "Controls if VPC should be created (it affects almost all resources)"
  type        = bool
  default     = true
}

variable "name" {
  description = "Name to be used on all the resources as identifier"
  type        = string
}

variable "env" {
  description = "The application environment"
  type        = string
}

variable "reponame" {
  description = "The repo name used to create a role for GitHub actions"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"
}

variable "allocated_storage" {
  description = "The allocated storage in gigabytes"
  type        = number
  default     = 5
}

variable "instance_class" {
  description = "The instance type of the RDS instance"
  type        = string
  default     = "db.t4g.micro"
}

variable "domain" {
  description = "The domain used to create a route 53 zone and ses domain sending identity"
  type        = string
}
