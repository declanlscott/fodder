output "fodder_bucket_name" {
  value = aws_s3_bucket.fodder.id
}

output "fodder_bucket_endpoint" {
  value = aws_s3_bucket_website_configuration.website_config.website_endpoint
}
