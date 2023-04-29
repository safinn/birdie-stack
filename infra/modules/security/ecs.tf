resource "aws_security_group" "ecs_sg" {
  name   = "${var.env}-${var.name}-ecs-sg"
  vpc_id = var.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "ecs_80" {
  count             = var.simple ? 1 : 0
  security_group_id = aws_security_group.ecs_sg.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "tcp"

  from_port = 80
  to_port   = 80
}

resource "aws_vpc_security_group_ingress_rule" "ecs_443" {
  count             = var.simple ? 1 : 0
  security_group_id = aws_security_group.ecs_sg.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "tcp"

  from_port = 443
  to_port   = 443
}

resource "aws_vpc_security_group_ingress_rule" "ecs_alb" {
  count             = length(aws_security_group.alb) > 0 ? 1 : 0
  security_group_id = aws_security_group.ecs_sg.id

  referenced_security_group_id = aws_security_group.alb[0].id
  ip_protocol                  = "tcp"

  from_port = 0
  to_port   = 65535
}

resource "aws_vpc_security_group_egress_rule" "ecs" {
  security_group_id = aws_security_group.ecs_sg.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "tcp"

  from_port = 0
  to_port   = 65535
}
