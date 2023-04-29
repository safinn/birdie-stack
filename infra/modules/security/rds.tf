resource "aws_security_group" "rds_sg" {
  name   = "${var.env}-${var.name}-rds-sg"
  vpc_id = var.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "rds" {
  security_group_id = aws_security_group.rds_sg.id

  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.ecs_sg.id
}

resource "aws_vpc_security_group_egress_rule" "rds" {
  security_group_id = aws_security_group.rds_sg.id
  from_port         = 0
  to_port           = 65535
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
}
