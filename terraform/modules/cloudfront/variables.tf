variable "static_website_bucket_id" {
  description = "Unique identifier for the static website bucket origin"
  type        = string
}

variable "static_website_bucket_website_endpoint" {
  description = "Website endpoint for the static website bucket origin"
  type        = string
}

variable "restaurant_lambda_function_name" {
  description = "Unique identifer for the restaurant lambda origin"
  type        = string
}

variable "restaurant_lambda_function_url" {
  description = "Function URL for the restaurant lambda origin"
  type        = string
}

variable "restaurants_lambda_function_name" {
  description = "Unique identifer for the restaurants lambda origin"
  type        = string
}

variable "restaurants_lambda_function_url" {
  description = "Function URL for the restaurants lambda origin"
  type        = string
}

variable "flavor_lambda_function_name" {
  description = "Unique identifer for the flavor lambda origin"
  type        = string
}

variable "flavor_lambda_function_url" {
  description = "Function URL for the flavor lambda origin"
  type        = string
}

variable "flavors_lambda_function_name" {
  description = "Unique identifer for the flavors lambda origin"
  type        = string
}

variable "flavors_lambda_function_url" {
  description = "Function URL for the flavors lambda origin"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate that you wish to use with this distribution"
  type        = string
}

variable "aliases" {
  description = "Extra CNAMEs (alternate domain names), if any, for this distribution"
  type        = list(string)
}
