output "ecs_cluster_id" {
  value = aws_ecs_cluster.ecs.id
}

output "task_execution_role_arn" {
  value = aws_iam_role.ecs_task_execution_role.arn
}

output "task_role_arn" {
  value = aws_iam_role.ecs_task_role.arn
}

output "target_group_arn" {
  value = length(aws_lb_target_group.alb-tg) > 0 ? aws_lb_target_group.alb-tg[0].arn : null
}

output "capacity_provider_name" {
  value = aws_ecs_capacity_provider.this.name
}
