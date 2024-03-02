variable "name" {
  description = "The name of the api function"
  type        = string
}

variable "cors_origin" {
  description = "The origin to allow CORS requests from"
  type        = string
}

variable "environment_variables" {
  description = "Map of environment variables that are accessible from the function code during execution"
  type        = map(string)
  default     = null
}
