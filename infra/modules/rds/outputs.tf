output "host" {
  value = aws_db_instance.postgres-rds.address
}

output "port" {
  value = aws_db_instance.postgres-rds.port
}

output "database" {
  value = aws_db_instance.postgres-rds.db_name
}

output "username" {
  value = aws_db_instance.postgres-rds.username
}

output "db_password_secret_arn" {
  value = aws_secretsmanager_secret.rds_password.arn
}
