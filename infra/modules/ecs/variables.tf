variable "name" {
  description = "Name to be used on all the resources as identifier"
  type        = string
  default     = ""
}

variable "env" {
  description = "The application environment"
  type        = string
}

variable "public_subnet_ids" {
  description = "Subnets to use to auto scale instances"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "Subnets to use to auto scale instances"
  type        = list(string)
}

variable "security_group" {
  description = "Security group for instances"
  type        = string
}

variable "alb_security_group" {
  description = "Security group for the alb"
  type        = string
}

variable "domain" {
  description = "The domain to generate certs with lets encrypt"
  type        = string
}

variable "hosted_zone_arn" {
  description = "The ARN of the hosted zone ID created in the DNS module"
  type        = string
}

variable "domain_identity_arn" {
  description = "The ARN of the domain identity set up in SES"
  type        = string
  default     = ""
}

variable "db_password_secret_arn" {
  description = "The ARN of the db password secret in secrets manager"
  type        = string
  default     = ""
}

variable "ec2_instance_type" {
  description = "The instance type to use for EC2 instances"
  type        = string
  default     = "t4g.nano"
}

variable "vpc_id" {
  description = "The ID of the VPC"
  type        = string
}

variable "cert_arn" {
  description = "The app domain ssl certificate"
  type        = string
}

variable "min_instances" {
  description = "Minimum number of ec2 instances the ECS cluster should scale to"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of ec2 instances the ECS cluster should scale to"
  type        = number
  default     = 1
}

variable "simple" {
  description = "Simple single instance, nonscalable, cheap deployment."
  type        = bool
  default     = true
}
