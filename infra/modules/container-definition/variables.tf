variable "name" {
  description = "Name to be used on all the resources as identifier"
  type        = string
  default     = ""
}

variable "env" {
  description = "The application environment"
  type        = string
}

variable "external_image" {
  description = "the external image to use"
  default     = ""
}

variable "memory" {
  description = ""
  default     = 256
}

variable "mountPoints" {
  description = "The mount points for data volumes in the container"
  default     = []
}

variable "volumes" {
  description = "Configuration block for volumes that containers in tasks may use"
  default     = []
}

variable "portMappings" {
  description = "host and container ports to map"
  default     = []
}

variable "labels" {
  description = ""
  default     = {}
}

variable "dependsOn" {
  description = "value"
  type        = list(any)
  default     = []
}

variable "volumesFrom" {
  description = "value"
  type        = list(any)
  default     = []
}

variable "healthCheckCommand" {
  description = "health check command"
  type        = list(any)
  default     = ["CMD-SHELL", "exit 0"]
}

variable "env_vars" {
  description = "list of environment variables to include in the task"
  type        = list(any)
  default     = []
}
