variable "name" {
  description = "Name to be used on all the resources as identifier"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"
}
