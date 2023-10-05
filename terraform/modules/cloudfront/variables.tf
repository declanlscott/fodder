variable "origin_domain_name" {
  description = "DNS domain dame of the S3 bucket"
  type        = string
}

variable "origin_id" {
  description = "Unique identifier for the origin"
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
