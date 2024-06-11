variable "aws_profile" {
  description = "AWS profile"
  type        = string
  default     = "default"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "root_domain_name" {
  description = "Root domain name"
  type        = string
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID"
  type        = string
  sensitive   = true
}

variable "api_function_external_api_base_url" {
  type = string
}

variable "api_function_restaurant_scrape_base_url" {
  type = string
}

variable "api_function_flavors_scrape_base_url" {
  type = string
}

variable "api_function_flavor_image_base_url" {
  type = string
}

variable "api_function_logo_svg_url" {
  type = string
}

variable "api_function_cors_origin" {
  type = string
}
