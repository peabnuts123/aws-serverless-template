# Lambda functions for each endpoint
resource "aws_lambda_function" "lambda" {
  for_each = local.all_lambda_functions

  function_name = each.value.name
  filename      = var.code_package_file_path
  description   = "Handler for ${var.project_id}: ${each.key}"
  role          = aws_iam_role.lambda.arn
  handler       = each.value.handler
  runtime       = "nodejs12.x"
  memory_size   = 256
  timeout       = 3

  tags = {
    project     = var.project_id
    environment = var.environment_id
  }

  environment {
    variables = {
      NODE_ENV = "production"
      ENVIRONMENT_ID = var.environment_id
      PROJECT_ID = var.project_id
    }
  }
}
resource "aws_lambda_permission" "lambda" {
  for_each = local.all_lambda_functions

  function_name = each.value.name
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # The /*/*/* part allows invocation from any stage, method and resource path
  # within API Gateway REST API.
  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*/*"
}
