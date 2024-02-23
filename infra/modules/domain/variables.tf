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

variable "cloudfront_distribution_domain_name" {
  description = "The CloudFront distribution domain name for the app"
  type        = string
}

variable "app_domain_name" {
  description = "The domain name for the app"
  type        = string
}
