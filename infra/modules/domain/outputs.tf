output "certificate_arn" {
  description = "ARN of the certificate for the app"
  value       = aws_acm_certificate.app.arn
}
