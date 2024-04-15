terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.45.0"
    }
  }

  #######################################################################
  ## After running `terraform apply` (with local backend)
  ## verify that the bucket name matches the one in the remote backend.
  ## Uncomment this block and then re-run `terraform init`
  ## to switch from local backend to remote AWS backend
  #######################################################################
  backend "s3" {
    bucket         = "terraform-state-6dc4a2a1-458f-b4cb-d388-da84462a0dc7"
    key            = "fodder/prod/terraform.tfstate"
    region         = "us-east-2"
    dynamodb_table = "terraform-state-locking"
    encrypt        = true
  }
}

provider "aws" {
  region = "us-east-2"
}

module "remote_backend" {
  source = "./modules/remote-backend"
}

locals {
  app_subdomain = "fodder"
  api_subdomain = "fodder-api"
}

module "app_domain" {
  source                              = "./modules/domain"
  cloudflare_api_token                = var.cloudflare_api_token
  cloudflare_zone_id                  = var.cloudflare_zone_id
  cloudfront_distribution_domain_name = module.app_distribution.domain_name
  subdomain                           = local.app_subdomain
  root_domain_name                    = var.root_domain_name
}

module "app_distribution" {
  source                      = "./modules/cdn/app"
  bucket_name                 = module.app_bucket.name
  bucket_regional_domain_name = module.app_bucket.regional_domain_name
  certificate_arn             = module.app_domain.certificate_arn
}

module "app_bucket" {
  source           = "./modules/origin/app"
  domain_name      = module.app_domain.name
  distribution_arn = module.app_distribution.arn
}

locals {
  cors_origin = "https://${module.app_domain.name}"
}

module "api_domain" {
  source                              = "./modules/domain"
  cloudflare_api_token                = var.cloudflare_api_token
  cloudflare_zone_id                  = var.cloudflare_zone_id
  cloudfront_distribution_domain_name = module.api_distribution.domain_name
  subdomain                           = local.api_subdomain
  root_domain_name                    = var.root_domain_name
}

module "api_distribution" {
  source          = "./modules/cdn/api"
  function_name   = module.api_function.name
  function_url    = module.api_function.url
  certificate_arn = module.api_domain.certificate_arn
  api_domain_name = module.api_domain.name
  cors_origin     = local.cors_origin
}

module "api_function" {
  source      = "./modules/origin/api"
  name        = local.api_subdomain
  cors_origin = local.cors_origin
  environment_variables = {
    EXTERNAL_API_BASE_URL      = var.api_function_external_api_base_url
    RESTAURANT_SCRAPE_BASE_URL = var.api_function_restaurant_scrape_base_url
    FLAVORS_SCRAPE_BASE_URL    = var.api_function_flavors_scrape_base_url
    FLAVOR_IMAGE_BASE_URL      = var.api_function_flavor_image_base_url
    LOGO_SVG_URL               = var.api_function_logo_svg_url
    CORS_ORIGIN                = var.api_function_cors_origin
  }
}
