output "iam_for_lambda" {
  value = aws_iam_role.iam_for_lambda
}

output "lambda_logs_policy_attachment" {
  value = aws_iam_role_policy_attachment.lambda_logs
}
