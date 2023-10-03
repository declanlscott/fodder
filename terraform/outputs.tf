output "name_servers" {
  value = aws_route53_zone.fodder.name_servers
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

output "fodder_bucket_endpoint" {
  value = module.fodder_bucket.fodder_bucket_endpoint
}
