output "name" {
  value = aws_lambda_function.api.function_name
}

output "url" {
  value = aws_lambda_function_url.api.function_url
}
