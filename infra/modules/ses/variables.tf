variable "name" {
  description = "Name to be used on all the resources as identifier"
  type        = string
  default     = ""
}

variable "env" {
  description = "The application environment"
  type        = string
}

variable "domain" {
  description = "The domain to create a ses domain identity with"
  type        = string
}

variable "route53_zone_id" {
  description = "The route 53 zone ID"
  type        = string
}

variable "email" {
  description = "Email address to receive bounce and complain notifications"
  type        = string
}
