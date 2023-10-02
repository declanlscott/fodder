variable "api_id" {
  description = "API identifier"
  type        = string
}

variable "route_key" {
  description = "Route key for the route"
  type        = string
}

variable "integration_uri" {
  description = "URI of the Lambda function for a Lambda proxy integration"
  type        = string
}

variable "integration_description" {
  description = "Description of the integration"
  type        = string
}
