resource "aws_ses_domain_identity" "domain_identity" {
  domain = var.domain
}

resource "aws_route53_record" "amazonses_verification_record" {
  zone_id = var.route53_zone_id
  name    = "_amazonses.${aws_ses_domain_identity.domain_identity.domain}"
  type    = "TXT"
  ttl     = "600"
  records = [aws_ses_domain_identity.domain_identity.verification_token]
}

resource "aws_ses_domain_identity_verification" "ses_verification" {
  domain = aws_ses_domain_identity.domain_identity.id

  depends_on = [aws_route53_record.amazonses_verification_record]
}

resource "aws_ses_domain_dkim" "default" {
  domain = aws_ses_domain_identity.domain_identity.domain
}

resource "aws_route53_record" "dkim" {
  count   = 3
  zone_id = var.route53_zone_id
  name    = format("%s._domainkey.%s", element(aws_ses_domain_dkim.default.dkim_tokens, count.index), aws_ses_domain_identity.domain_identity.domain)
  type    = "CNAME"
  ttl     = 600
  records = [format("%s.dkim.amazonses.com", element(aws_ses_domain_dkim.default.dkim_tokens, count.index))]
}

resource "aws_ses_domain_mail_from" "default" {
  domain           = aws_ses_domain_identity.domain_identity.domain
  mail_from_domain = "bounce.${aws_ses_domain_identity.domain_identity.domain}"
}

resource "aws_route53_record" "spf_mail_from" {
  zone_id = var.route53_zone_id
  name    = aws_ses_domain_mail_from.default.mail_from_domain
  type    = "TXT"
  ttl     = "600"
  records = ["v=spf1 include:amazonses.com -all"]
}

resource "aws_route53_record" "spf_domain" {
  zone_id = var.route53_zone_id
  name    = aws_ses_domain_identity.domain_identity.domain
  type    = "TXT"
  ttl     = "600"
  records = ["v=spf1 include:amazonses.com -all"]
}

data "aws_region" "current" {}

resource "aws_route53_record" "mx_send_mail_from" {
  zone_id = var.route53_zone_id
  name    = aws_ses_domain_mail_from.default.mail_from_domain
  type    = "MX"
  ttl     = "600"
  records = [format("10 feedback-smtp.%s.amazonses.com", data.aws_region.current.name)]
}

resource "aws_ses_configuration_set" "ses" {
  name = "bounce-complaint-configuration-set"
}

// sns

resource "aws_sns_topic" "ses_bounce_complaints_topic" {
  name = "ses-bounce-complaints-topic"
}

resource "aws_ses_identity_notification_topic" "ses_bounces" {
  topic_arn                = aws_sns_topic.ses_bounce_complaints_topic.arn
  notification_type        = "Bounce"
  identity                 = aws_ses_domain_identity.domain_identity.domain
  include_original_headers = true
}

resource "aws_ses_identity_notification_topic" "ses_complaints" {
  topic_arn                = aws_sns_topic.ses_bounce_complaints_topic.arn
  notification_type        = "Complaint"
  identity                 = aws_ses_domain_identity.domain_identity.domain
  include_original_headers = true
}

resource "aws_sns_topic_subscription" "ses_bounces_complaints_subscription" {
  topic_arn              = aws_sns_topic.ses_bounce_complaints_topic.arn
  protocol               = "email-json"
  endpoint               = var.email
  endpoint_auto_confirms = true
}
