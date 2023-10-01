output "api_invoke_url" {
  value = aws_apigatewayv2_stage.v1.invoke_url
}

output "upstash_redis_endpoint" {
  value = upstash_redis_database.fodder.endpoint
}
