variable "name" {
  description = "Name to be used on all the resources as identifier"
  type        = string
  default     = ""
}

variable "env" {
  description = "The application environment"
  type        = string
}

variable "simple" {
  description = "Simple single instance, nonscalable, cheap deployment."
  type        = bool
  default     = true
}
