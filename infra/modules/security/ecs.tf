resource "aws_security_group" "ecs_sg" {
  name   = "${var.env}-${var.name}-ecs-sg"
  vpc_id = var.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "ecs_80" {
  security_group_id = aws_security_group.ecs_sg.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "tcp"

  from_port = 80
  to_port   = 80
}

resource "aws_vpc_security_group_ingress_rule" "ecs_443" {
  security_group_id = aws_security_group.ecs_sg.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "tcp"

  from_port = 443
  to_port   = 443
}

resource "aws_vpc_security_group_ingress_rule" "ecs_22" {
  security_group_id = aws_security_group.ecs_sg.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "tcp"

  from_port = 22
  to_port   = 22
}

resource "aws_vpc_security_group_egress_rule" "ecs" {
  security_group_id = aws_security_group.ecs_sg.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "tcp"

  from_port = 0
  to_port   = 65535
}
