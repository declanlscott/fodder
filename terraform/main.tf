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
resource "aws_s3_bucket" "terraform_state" {
  bucket        = "fodder-tf-state"
  force_destroy = true
}
resource "aws_s3_bucket_versioning" "terraform_bucket_versioning" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state_crypto_config" {
  bucket = aws_s3_bucket.terraform_state.bucket
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-state-locking"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
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
resource "aws_apigatewayv2_integration" "restaurants" {
  api_id                 = aws_apigatewayv2_api.fodder.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.restaurants.invoke_arn
  payload_format_version = "2.0"
  description            = "Get restaurants by location"
}
resource "aws_apigatewayv2_route" "restaurants" {
  api_id    = aws_apigatewayv2_api.fodder.id
  route_key = "GET /restaurants"
  target    = "integrations/${aws_apigatewayv2_integration.restaurants.id}"
}
resource "aws_apigatewayv2_integration" "restaurant" {
  api_id                 = aws_apigatewayv2_api.fodder.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.restaurant.invoke_arn
  payload_format_version = "2.0"
  description            = "Get upcoming flavors by restaurant"
}
resource "aws_apigatewayv2_route" "restaurant" {
  api_id    = aws_apigatewayv2_api.fodder.id
  route_key = "GET /restaurant/{slug}"
  target    = "integrations/${aws_apigatewayv2_integration.restaurant.id}"
}
resource "aws_apigatewayv2_integration" "flavor" {
  api_id                 = aws_apigatewayv2_api.fodder.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.flavor.invoke_arn
  payload_format_version = "2.0"
  description            = "Get flavor details"
}
resource "aws_apigatewayv2_route" "flavor" {
  api_id    = aws_apigatewayv2_api.fodder.id
  route_key = "GET /flavor/{slug}"
  target    = "integrations/${aws_apigatewayv2_integration.flavor.id}"
}
resource "aws_apigatewayv2_integration" "flavors" {
  api_id                 = aws_apigatewayv2_api.fodder.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.flavors.invoke_arn
  payload_format_version = "2.0"
  description            = "Get all flavors"
}
resource "aws_apigatewayv2_route" "flavors" {
  api_id    = aws_apigatewayv2_api.fodder.id
  route_key = "GET /flavors"
  target    = "integrations/${aws_apigatewayv2_integration.flavors.id}"
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "iam_for_lambda" {
  name               = "iam_for_lambda"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

data "archive_file" "restaurants_lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/lambdas/restaurants/bin/bootstrap"
  output_path = "${path.module}/../backend/lambdas/restaurants/bin/lambda_function_payload.zip"
}
resource "aws_lambda_function" "restaurants" {
  function_name    = "fodder-restaurants"
  filename         = data.archive_file.restaurants_lambda_zip.output_path
  source_code_hash = data.archive_file.restaurants_lambda_zip.output_base64sha256
  role             = aws_iam_role.iam_for_lambda.arn
  handler          = "bootstrap"
  runtime          = "provided.al2"
  architectures    = ["arm64"]
  timeout          = 15
}
resource "aws_lambda_permission" "allow_restaurants_api" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.restaurants.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.fodder.execution_arn}/*/GET/restaurants"
}

data "archive_file" "restaurant_lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/lambdas/restaurant/bin/bootstrap"
  output_path = "${path.module}/../backend/lambdas/restaurant/bin/lambda_function_payload.zip"
}
resource "aws_lambda_function" "restaurant" {
  function_name    = "fodder-restaurant"
  filename         = data.archive_file.restaurant_lambda_zip.output_path
  source_code_hash = data.archive_file.restaurant_lambda_zip.output_base64sha256
  role             = aws_iam_role.iam_for_lambda.arn
  handler          = "bootstrap"
  runtime          = "provided.al2"
  architectures    = ["arm64"]
  timeout          = 15

  environment {
    variables = {
      UPSTASH_REDIS_URL = "rediss://${var.upstash_redis_user}:${var.upstash_redis_password}@${upstash_redis_database.fodder.endpoint}:${var.upstash_redis_port}"
    }
  }
}
resource "aws_lambda_permission" "allow_restaurant_api" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.restaurant.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.fodder.execution_arn}/*/GET/restaurant/*"
}

data "archive_file" "flavor_lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/lambdas/flavor/bin/bootstrap"
  output_path = "${path.module}/../backend/lambdas/flavor/bin/lambda_function_payload.zip"
}
resource "aws_lambda_function" "flavor" {
  function_name    = "fodder-flavor"
  filename         = data.archive_file.flavor_lambda_zip.output_path
  source_code_hash = data.archive_file.flavor_lambda_zip.output_base64sha256
  role             = aws_iam_role.iam_for_lambda.arn
  handler          = "bootstrap"
  runtime          = "provided.al2"
  architectures    = ["arm64"]
  timeout          = 15
}
resource "aws_lambda_permission" "allow_flavor_api" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.flavor.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.fodder.execution_arn}/*/GET/flavor/*"
}

data "archive_file" "flavors_lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../backend/lambdas/flavors/bin/bootstrap"
  output_path = "${path.module}/../backend/lambdas/flavors/bin/lambda_function_payload.zip"
}
resource "aws_lambda_function" "flavors" {
  function_name    = "fodder-flavors"
  filename         = data.archive_file.flavors_lambda_zip.output_path
  source_code_hash = data.archive_file.flavors_lambda_zip.output_base64sha256
  role             = aws_iam_role.iam_for_lambda.arn
  handler          = "bootstrap"
  runtime          = "provided.al2"
  architectures    = ["arm64"]
  timeout          = 15
}
resource "aws_lambda_permission" "allow_flavors_api" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.flavors.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.fodder.execution_arn}/*/GET/flavors"
}

# Bucket for test files
resource "aws_s3_bucket" "fodder_test_files" {
  bucket        = "fodder-test-files"
  force_destroy = true
}
resource "aws_s3_bucket_versioning" "fodder_test_files_bucket_versioning" {
  bucket = aws_s3_bucket.fodder_test_files.id
  versioning_configuration {
    status = "Enabled"
  }
}
resource "aws_s3_bucket_server_side_encryption_configuration" "fodder_test_files_crypto_config" {
  bucket = aws_s3_bucket.fodder_test_files.bucket
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
resource "aws_s3_object" "mock_responses" {
  bucket       = aws_s3_bucket.fodder_test_files.bucket
  key          = "mock-responses/"
  content_type = "application/x-directory"
  acl          = "private"
}

# Upstash redis
resource "upstash_redis_database" "fodder" {
  database_name = "fodder-cache"
  region        = var.upstash_redis_region
  tls           = "true"
}
