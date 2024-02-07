terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.33.0"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "2.4.1"
    }
  }

  ###################################################################
  ## After running `terraform apply` (with local backend)
  ## you will uncomment this block and then re-run `terraform init`
  ## to switch from local backend to remote AWS backend
  ###################################################################
  backend "s3" {
    bucket         = "fodder-tf-state"
    key            = "tf-bootstrap/terraform.tfstate"
    region         = "us-east-2"
    dynamodb_table = "terraform-state-locking"
    encrypt        = true
  }
}

provider "aws" {
  # Configuration options
  region = "us-east-2"
}

provider "archive" {
  # Configuration options
}

# Terraform remote backend bootstrap resources
module "remote_backend" {
  source = "./modules/remote-backend"
}

module "domain" {
  source                              = "./modules/domain"
  cloudflare_api_token                = var.cloudflare_api_token
  root_domain_name                    = var.domain
  cloudflare_zone_id                  = var.cloudflare_zone_id
  cloudfront_distribution_domain_name = module.fodder_distribution.domain_name
}

module "fodder_distribution" {
  source = "./modules/cloudfront"

  static_website_bucket_id               = module.fodder_bucket.fodder_bucket_id
  static_website_bucket_website_endpoint = module.fodder_bucket.fodder_bucket_website_endpoint

  restaurant_lambda_function_name = module.restaurant_lambda.function_name
  restaurant_lambda_function_url  = module.restaurant_lambda.function_url

  restaurants_lambda_function_name = module.restaurants_lambda.function_name
  restaurants_lambda_function_url  = module.restaurants_lambda.function_url

  flavor_lambda_function_name = module.flavor_lambda.function_name
  flavor_lambda_function_url  = module.flavor_lambda.function_url

  flavors_lambda_function_name = module.flavors_lambda.function_name
  flavors_lambda_function_url  = module.flavors_lambda.function_url

  acm_certificate_arn = module.domain.certificate_arn
  aliases             = ["fodder.${var.domain}"]
}

module "fodder_bucket" {
  source      = "./modules/static-website"
  bucket_name = "fodder.${var.domain}"
}

module "lambda_iam" {
  source = "./modules/lambda/iam"
}

module "restaurants_lambda" {
  source               = "./modules/lambda"
  lambda_function_name = "fodder-restaurants"
  archive_source_file  = "${path.module}/../backend/lambdas/restaurants/bin/bootstrap"
  archive_output_path  = "${path.module}/../backend/lambdas/restaurants/bin/lambda_function_payload.zip"
  lambda_role          = module.lambda_iam.iam_for_lambda.arn

  depends_on = [module.lambda_iam.lambda_logs_policy_attachment]
}

module "restaurant_lambda" {
  source               = "./modules/lambda"
  lambda_function_name = "fodder-restaurant"
  archive_source_file  = "${path.module}/../backend/lambdas/restaurant/bin/bootstrap"
  archive_output_path  = "${path.module}/../backend/lambdas/restaurant/bin/lambda_function_payload.zip"
  lambda_role          = module.lambda_iam.iam_for_lambda.arn

  depends_on = [module.lambda_iam.lambda_logs_policy_attachment]
}

module "flavors_lambda" {
  source               = "./modules/lambda"
  lambda_function_name = "fodder-flavors"
  archive_source_file  = "${path.module}/../backend/lambdas/flavors/bin/bootstrap"
  archive_output_path  = "${path.module}/../backend/lambdas/flavors/bin/lambda_function_payload.zip"
  lambda_role          = module.lambda_iam.iam_for_lambda.arn

  depends_on = [module.lambda_iam.lambda_logs_policy_attachment]
}

module "flavor_lambda" {
  source               = "./modules/lambda"
  lambda_function_name = "fodder-flavor"
  archive_source_file  = "${path.module}/../backend/lambdas/flavor/bin/bootstrap"
  archive_output_path  = "${path.module}/../backend/lambdas/flavor/bin/lambda_function_payload.zip"
  lambda_role          = module.lambda_iam.iam_for_lambda.arn

  depends_on = [module.lambda_iam.lambda_logs_policy_attachment]
}

# Bucket for test files
module "test_bucket" {
  source = "./modules/test-bucket"
}
