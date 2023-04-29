resource "aws_route53_zone" "primary" {
  name = var.domain
}

resource "aws_acm_certificate" "cert" {
  count             = var.simple ? 0 : 1
  domain_name       = var.domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "this" {
  for_each = {
    for dvo in length(aws_acm_certificate.cert) > 0 ? aws_acm_certificate.cert[0].domain_validation_options : [] : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
    if length(aws_acm_certificate.cert) > 0
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.primary.zone_id
}
