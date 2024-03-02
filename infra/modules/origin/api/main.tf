data "aws_iam_policy_document" "api" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "api" {
  name               = var.name
  assume_role_policy = data.aws_iam_policy_document.api.json
}

resource "aws_lambda_function" "api" {
  function_name = var.name
  filename      = "${path.module}/../../../../apps/backend/lambda.zip"
  role          = aws_iam_role.api.arn
  handler       = "index.handler"
  runtime       = "provided.al2023"
  architectures = ["arm64"]
  timeout       = 10

  environment {
    variables = var.environment_variables
  }

  depends_on = [aws_cloudwatch_log_group.api]
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/lambda/${var.name}"
  retention_in_days = 14
}

resource "aws_lambda_function_url" "api" {
  function_name      = aws_lambda_function.api.function_name
  authorization_type = "NONE"
  cors {
    allow_origins = [var.cors_origin]
    allow_methods = ["GET"]
  }
}

data "aws_iam_policy_document" "logging" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = ["arn:aws:logs:*:*:*"]
  }
}

resource "aws_iam_policy" "logging" {
  name        = "fodder-api-logging"
  path        = "/"
  description = "IAM policy for logging from fodder-api"
  policy      = data.aws_iam_policy_document.logging.json
}

resource "aws_iam_role_policy_attachment" "logging" {
  role       = aws_iam_role.api.name
  policy_arn = aws_iam_policy.logging.arn
}
