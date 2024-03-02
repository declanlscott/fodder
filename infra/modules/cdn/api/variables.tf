variable "function_name" {
  description = "The api function name"
  type        = string
}

variable "function_url" {
  description = "The api function url"
  type        = string
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate for the api"
  type        = string
}

variable "api_domain_name" {
  description = "The domain name of the api"
  type        = string
}

variable "cors_origin" {
  description = "The origin to allow CORS requests from"
  type        = string
}
