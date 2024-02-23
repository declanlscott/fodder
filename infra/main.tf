terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.37.0"
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
  app_domain_name = "fodder.${var.root_domain_name}"
}

module "app_domain" {
  source                              = "./modules/domain"
  cloudflare_api_token                = var.cloudflare_api_token
  cloudflare_zone_id                  = var.cloudflare_zone_id
  cloudfront_distribution_domain_name = module.app_distribution.domain_name
  app_domain_name                     = local.app_domain_name
}

module "app_distribution" {
  source                          = "./modules/cdn"
  app_bucket_name                 = module.app_bucket.name
  app_bucket_regional_domain_name = module.app_bucket.regional_domain_name
  app_certificate_arn             = module.app_domain.certificate_arn
}

module "app_bucket" {
  source               = "./modules/host"
  app_domain_name      = local.app_domain_name
  app_distribution_arn = module.app_distribution.arn
}
