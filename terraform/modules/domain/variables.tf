variable "cloudflare_api_token" {
  description = "The Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "root_domain_name" {
  description = "The root domain name"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "The Cloudflare zone ID for the domain"
  type        = string
}

variable "cloudfront_distribution_domain_name" {
  description = "The domain name of the CloudFront distribution"
  type        = string
}
