variable "domain" {
  description = "Root domain"
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

variable "upstash_email" {
  description = "Registered email in Upstash"
  type        = string
  sensitive   = true
}

variable "upstash_api_key" {
  description = "API key generated from Upstash Console"
  type        = string
  sensitive   = true
}

variable "upstash_redis_region" {
  description = "Region of the database. Possible values are: global, eu-west-1, us-east-1, us-west-1, ap-northeast-1 , eu-central1"
  type        = string
  default     = "us-east-1"
}

variable "upstash_redis_user" {
  type      = string
  sensitive = true
}

variable "upstash_redis_password" {
  type      = string
  sensitive = true
}

variable "upstash_redis_port" {
  type      = string
  sensitive = true
}
