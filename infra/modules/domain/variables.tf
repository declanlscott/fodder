variable "aws_profile" {
  description = "AWS profile"
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

variable "cloudfront_distribution_domain_name" {
  description = "The CloudFront distribution domain name"
  type        = string
}

variable "subdomain" {
  description = "The subdomain value"
  type        = string
}

variable "root_domain_name" {
  description = "The root domain name"
  type        = string
}
