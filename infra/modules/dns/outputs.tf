output "route53_zone_id" {
  value = aws_route53_zone.primary.zone_id
}

output "route53_zone_arn" {
  value = aws_route53_zone.primary.arn
}

output "cert_arn" {
  value = length(aws_acm_certificate.cert) > 0 ? aws_acm_certificate.cert[0].arn : null
}
