variable "name" {
  description = "Name to be used on all the resources as identifier"
  type        = string
  default     = ""
}

variable "env" {
  description = "The application environment"
  type        = string
}

variable "allocated_storage" {
  description = "The allocated storage in gigabytess"
  type        = number
  default     = 5
  nullable    = false
}

variable "instance_class" {
  description = "The instance type of the RDS instance"
  type        = string
  default     = "db.t4g.micro"
  nullable    = false
}

variable "subnet_ids" {
  description = "The list of subnet ids to assign to the db subnet group"
  type        = list(string)
}

variable "security_group" {
  description = "Security group for rds instance"
  type        = string
}
