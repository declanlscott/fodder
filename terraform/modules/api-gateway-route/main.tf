resource "aws_apigatewayv2_integration" "integration" {
  api_id                 = var.api_id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = var.integration_uri
  payload_format_version = "2.0"
  description            = var.integration_description
}

resource "aws_apigatewayv2_route" "route" {
  api_id    = var.api_id
  route_key = var.route_key
  target    = "integrations/${aws_apigatewayv2_integration.integration.id}"
}
