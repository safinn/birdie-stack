resource "aws_lb" "alb" {
  count              = var.simple ? 0 : 1
  name               = "${var.env}-${var.name}-ecs-alb"
  load_balancer_type = "application"
  internal           = false
  subnets            = var.public_subnet_ids
  security_groups    = [var.alb_security_group]
}

resource "aws_lb_target_group" "alb-tg" {
  count       = length(aws_lb.alb) > 0 ? 1 : 0
  name        = "${var.env}-${var.name}-alb-tg"
  target_type = "instance"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id

  health_check {
    path = "/healthcheck"
  }
}

resource "aws_alb_listener" "listener_http" {
  count             = length(aws_lb.alb) > 0 ? 1 : 0
  load_balancer_arn = aws_lb.alb[0].arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = 443
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_alb_listener" "listener_https" {
  count             = length(aws_lb.alb) > 0 ? 1 : 0
  load_balancer_arn = aws_lb.alb[0].arn
  port              = 443
  protocol          = "HTTPS"

  ssl_policy = "ELBSecurityPolicy-2016-08"

  certificate_arn = var.cert_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.alb-tg[0].arn
  }
}
