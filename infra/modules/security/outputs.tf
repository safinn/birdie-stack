output "rds_sg_id" {
  value = aws_security_group.rds_sg.id
}

output "ecs_sg_id" {
  value = aws_security_group.ecs_sg.id
}

output "alb_sg_id" {
  value = length(aws_security_group.alb) > 0 ? aws_security_group.alb[0].id : null
}
