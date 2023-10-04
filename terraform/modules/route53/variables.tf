variable "zone_name" {
  description = "This is the name of the hosted zone"
  type        = string
}

variable "bucket_alias_name" {
  description = "DNS domain name for a S3 bucket"
  type        = string
}

variable "bucket_alias_zone_id" {
  description = "Hosted zone ID for a S3 bucket"
  type        = string
}
