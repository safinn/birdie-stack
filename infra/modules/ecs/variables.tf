variable "name" {
  description = "Name to be used on all the resources as identifier"
  type        = string
  default     = ""
}

variable "env" {
  description = "The application environment"
  type        = string
}

variable "subnet_ids" {
  description = "Subnets to use to auto scale instances"
  type        = list(string)
}

variable "security_group" {
  description = "Security group for instances"
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
