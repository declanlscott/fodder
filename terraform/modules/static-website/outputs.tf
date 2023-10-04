output "fodder_bucket_name" {
  value = aws_s3_bucket.fodder.id
}

output "fodder_bucket_endpoint" {
  value = aws_s3_bucket_website_configuration.website_config.website_endpoint
}

output "fodder_bucket_hosted_zone_id" {
  value = aws_s3_bucket.fodder.hosted_zone_id
}

output "fodder_bucket_regional_domain_name" {
  value = aws_s3_bucket.fodder.bucket_regional_domain_name
}

output "fodder_bucket_id" {
  value = aws_s3_bucket.fodder.id
}

