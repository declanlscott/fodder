terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.17.0"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "2.4.0"
    }

    upstash = {
      source  = "upstash/upstash"
      version = "1.4.1"
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

provider "upstash" {
  email   = var.upstash_email
  api_key = var.upstash_api_key
}

# Terraform remote backend bootstrap resources
module "remote_backend" {
  source = "./modules/remote-backend"
}

module "fodder_zone" {
  source               = "./modules/route53"
  zone_name            = "fodder.${var.domain}"
  bucket_alias_name    = module.fodder_bucket.fodder_bucket_endpoint
  bucket_alias_zone_id = module.fodder_bucket.fodder_bucket_hosted_zone_id
}

module "fodder_distribution" {
  source              = "./modules/cloudfront"
  origin_domain_name  = module.fodder_bucket.fodder_bucket_regional_domain_name
  origin_id           = module.fodder_bucket.fodder_bucket_id
  acm_certificate_arn = module.fodder_zone.certificate_arn
}

module "fodder_bucket" {
  source      = "./modules/static-website"
  bucket_name = module.fodder_zone.zone_name
}

locals {
  upstash_redis_url = "rediss://${var.upstash_redis_user}:${var.upstash_redis_password}@${upstash_redis_database.fodder.endpoint}:${var.upstash_redis_port}"
}

resource "aws_apigatewayv2_api" "fodder" {
  name          = "fodder-http-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET"]
  }
}
resource "aws_apigatewayv2_stage" "v1" {
  api_id      = aws_apigatewayv2_api.fodder.id
  name        = "v1"
  auto_deploy = true
  default_route_settings {
    throttling_burst_limit = 50
    throttling_rate_limit  = 100
  }
}

module "restaurants_route" {
  source                  = "./modules/api-gateway-route"
  api_id                  = aws_apigatewayv2_api.fodder.id
  route_key               = "GET /restaurants"
  integration_uri         = module.restaurants_lambda.function_invoke_arn
  integration_description = "Get restaurants by location"
}
module "restaurant_route" {
  source                  = "./modules/api-gateway-route"
  api_id                  = aws_apigatewayv2_api.fodder.id
  route_key               = "GET /restaurants/{slug}"
  integration_uri         = module.restaurant_lambda.function_invoke_arn
  integration_description = "Get upcoming flavors be restaurant"
}
module "flavors_route" {
  source                  = "./modules/api-gateway-route"
  api_id                  = aws_apigatewayv2_api.fodder.id
  route_key               = "GET /flavors"
  integration_uri         = module.flavors_lambda.function_invoke_arn
  integration_description = "Get all flavors"
}
module "flavor_route" {
  source                  = "./modules/api-gateway-route"
  api_id                  = aws_apigatewayv2_api.fodder.id
  route_key               = "GET /flavors/{slug}"
  integration_uri         = module.flavor_lambda.function_invoke_arn
  integration_description = "Get flavor details"
}

module "lambda_iam" {
  source = "./modules/lambda/iam"
}

module "restaurants_lambda" {
  source                       = "./modules/lambda"
  lambda_function_name         = "fodder-restaurants"
  archive_source_file          = "${path.module}/../backend/lambdas/restaurants/bin/bootstrap"
  archive_output_path          = "${path.module}/../backend/lambdas/restaurants/bin/lambda_function_payload.zip"
  lambda_role                  = module.lambda_iam.iam_for_lambda.arn
  lambda_permission_source_arn = "${aws_apigatewayv2_api.fodder.execution_arn}/*/GET/restaurants"

  depends_on = [module.lambda_iam.lambda_logs_policy_attachment]
}

module "restaurant_lambda" {
  source               = "./modules/lambda"
  lambda_function_name = "fodder-restaurant"
  archive_source_file  = "${path.module}/../backend/lambdas/restaurant/bin/bootstrap"
  archive_output_path  = "${path.module}/../backend/lambdas/restaurant/bin/lambda_function_payload.zip"
  lambda_role          = module.lambda_iam.iam_for_lambda.arn
  lambda_environment_variables = {
    UPSTASH_REDIS_URL = local.upstash_redis_url
  }
  lambda_permission_source_arn = "${aws_apigatewayv2_api.fodder.execution_arn}/*/GET/restaurants/*"

  depends_on = [module.lambda_iam.lambda_logs_policy_attachment]
}

module "flavors_lambda" {
  source                       = "./modules/lambda"
  lambda_function_name         = "fodder-flavors"
  archive_source_file          = "${path.module}/../backend/lambdas/flavors/bin/bootstrap"
  archive_output_path          = "${path.module}/../backend/lambdas/flavors/bin/lambda_function_payload.zip"
  lambda_role                  = module.lambda_iam.iam_for_lambda.arn
  lambda_permission_source_arn = "${aws_apigatewayv2_api.fodder.execution_arn}/*/GET/flavors"

  depends_on = [module.lambda_iam.lambda_logs_policy_attachment]
}

module "flavor_lambda" {
  source               = "./modules/lambda"
  lambda_function_name = "fodder-flavor"
  archive_source_file  = "${path.module}/../backend/lambdas/flavor/bin/bootstrap"
  archive_output_path  = "${path.module}/../backend/lambdas/flavor/bin/lambda_function_payload.zip"
  lambda_role          = module.lambda_iam.iam_for_lambda.arn
  lambda_environment_variables = {
    UPSTASH_REDIS_URL = local.upstash_redis_url
  }
  lambda_permission_source_arn = "${aws_apigatewayv2_api.fodder.execution_arn}/*/GET/flavors/*"

  depends_on = [module.lambda_iam.lambda_logs_policy_attachment]
}

# Upstash redis
resource "upstash_redis_database" "fodder" {
  database_name = "fodder-cache"
  region        = var.upstash_redis_region
  tls           = "true"
}

# Bucket for test files
module "test_bucket" {
  source = "./modules/test-bucket"
}
