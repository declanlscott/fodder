variable "domain_name" {
  description = "App domain name"
  type        = string
}

variable "distribution_arn" {
  description = "ARN of the CloudFront distribution for the app"
  type        = string
}
