variable "zone_name" {
  description = "This is the name of the hosted zone"
  type        = string
}

variable "alias_name" {
  description = "DNS domain name for a CloudFront distribution"
  type        = string
}

variable "alias_zone_id" {
  description = "Hosted zone ID for a CloudFront distribution"
  type        = string
}
