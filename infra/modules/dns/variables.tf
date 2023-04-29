variable "domain" {
  description = "The domain used to create a route 53 zone"
  type        = string
}

variable "simple" {
  description = "Simple single instance, nonscalable, cheap deployment."
  type        = bool
  default     = true
}
