variable "app_bucket_name" {
  description = "The app bucket name"
  type        = string
}

variable "app_bucket_regional_domain_name" {
  description = "The app bucket regional domain name"
  type        = string
}

variable "app_certificate_arn" {
  description = "ARN of the ACM certificate for the app"
  type        = string
}
