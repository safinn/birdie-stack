variable "name" {
  description = "Name to be used on all the resources as identifier"
  type        = string
  default     = ""
}

variable "env" {
  description = "The application environment"
  type        = string
}

variable "ecs_cluster_id" {
  description = "ECS cluster ID"
  type        = string
}

variable "container_definitions" {
  description = "the container definitions to use in the service"
}

variable "deployment_maximum_percent" {
  description = "Upper limit (as a percentage of the service's desiredCount) of the number of running tasks that can be running in a service during a deployment"
  default     = 100
}

variable "volumes" {
  description = "Configuration block for volumes that containers in tasks may use"
  default     = []
}

variable "task_execution_role_arn" {
  description = "The role arn for tasks execution"
  type        = string
  default     = null
}

variable "task_role_arn" {
  description = "The role arn for tasks"
  type        = string
  default     = null
}

variable "target_group_arn" {
  description = "The ALB target group the service should be in"
  type        = string
  default     = null
}

variable "capacity_provider_name" {
  description = "The name of the capacity provider"
  type        = string
}

variable "simple" {
  description = "Simple single instance, nonscalable, cheap deployment."
  type        = bool
  default     = true
}

variable "app_instance_count" {
  description = "Number of instances of the application to run"
  type        = number
  default     = 1
}
