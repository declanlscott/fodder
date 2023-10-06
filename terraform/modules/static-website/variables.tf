variable "bucket_name" {
  description = "Name of the bucket for static website hosting"
  type        = string
}

variable "cloudfront_distribution_arn" {
  description = "ARN for the distribution"
  type        = string
}
