output "name_servers" {
  value = module.fodder_zone.name_servers
}

output "api_invoke_url" {
  value = aws_apigatewayv2_stage.v1.invoke_url
}

output "upstash_redis_endpoint" {
  value = upstash_redis_database.fodder.endpoint
}

output "fodder_bucket_name" {
  value = module.fodder_bucket.fodder_bucket_name
}

output "fodder_cloudfront_url" {
  value = module.fodder_distribution.domain_name
}
