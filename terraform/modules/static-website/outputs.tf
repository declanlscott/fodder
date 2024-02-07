output "fodder_bucket_name" {
  value = aws_s3_bucket.fodder.id
}

output "fodder_bucket_website_endpoint" {
  value = aws_s3_bucket_website_configuration.config.website_endpoint
}

output "fodder_bucket_id" {
  value = aws_s3_bucket.fodder.id
}
