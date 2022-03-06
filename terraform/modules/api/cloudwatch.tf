# Lambda functions
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${local.lambda_function.name}"
  retention_in_days = 14
}
