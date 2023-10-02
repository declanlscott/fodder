data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = var.archive_source_file
  output_path = var.archive_output_path
}

resource "aws_lambda_function" "function" {
  function_name    = var.lambda_function_name
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  role             = var.lambda_role
  handler          = "bootstrap"
  runtime          = "provided.al2"
  architectures    = ["arm64"]
  timeout          = 15

  environment {
    variables = var.lambda_environment_variables
  }

  depends_on = [aws_cloudwatch_log_group.log_group]
}

resource "aws_cloudwatch_log_group" "log_group" {
  name              = "/aws/lambda/${var.lambda_function_name}"
  retention_in_days = 14
}

resource "aws_lambda_permission" "allow_api" {
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = var.lambda_permission_source_arn
}
