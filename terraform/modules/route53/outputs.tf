output "zone_name" {
  value = aws_route53_zone.zone.name
}

output "name_servers" {
  value = aws_route53_zone.zone.name_servers
}

output "certificate_arn" {
  value = aws_acm_certificate.certificate.arn
}
