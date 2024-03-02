output "name" {
  description = "The domain name"
  value       = local.domain_name
}

output "certificate_arn" {
  description = "ARN of the certificate"
  value       = aws_acm_certificate.cert.arn
}
