resource "aws_db_subnet_group" "group" {
  name       = "${var.env}-${var.name}-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name        = "${var.env}-${var.name}-db-subnet-group"
    Environment = "${var.env}"
  }
}

resource "aws_secretsmanager_secret" "rds_password" {
  name                    = "${var.env}-${var.name}-rds-password"
  recovery_window_in_days = 0
}

resource "random_password" "master" {
  length           = 16
  special          = true
  override_special = "_!%^"
}

resource "aws_secretsmanager_secret_version" "rds_password" {
  secret_id     = aws_secretsmanager_secret.rds_password.id
  secret_string = random_password.master.result
}

resource "aws_db_instance" "postgres-rds" {
  identifier        = "${var.env}-${var.name}-postgres-rds"
  db_name           = replace(var.name, "-", "")
  allocated_storage = var.allocated_storage
  instance_class    = var.instance_class
  engine            = "postgres"
  engine_version    = "14.6"

  deletion_protection          = false
  performance_insights_enabled = true

  vpc_security_group_ids = [var.security_group]

  username = replace(var.name, "-", "")
  password = aws_secretsmanager_secret_version.rds_password.secret_string
  port     = 5432

  skip_final_snapshot = true

  backup_retention_period = 5

  db_subnet_group_name = aws_db_subnet_group.group.name
  storage_encrypted    = true

  tags = {
    Name        = "${var.env}-${var.name}-rds-postgres"
    Environment = "${var.env}"
  }
}
