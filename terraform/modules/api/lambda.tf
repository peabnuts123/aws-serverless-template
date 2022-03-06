# Lambda functions for each endpoint
resource "aws_lambda_function" "api" {
  function_name = local.lambda_function.name
  filename      = var.code_package_file_path
  description   = "API for ${var.project_id}"
  role          = aws_iam_role.lambda.arn
  handler       = local.lambda_function.handler
  runtime       = "dotnet6"
  memory_size   = 1024
  timeout       = 15

  environment {
    variables = {
      ASPNETCORE_ENVIRONMENT = "Production"
      ENVIRONMENT_ID = var.environment_id
      PROJECT_ID = var.project_id
    }
  }

  lifecycle {
    # Ignore independently deployed changes to code
    ignore_changes = [
      last_modified,
      source_code_hash,
      source_code_size,
    ]
  }
}
resource "aws_lambda_permission" "api" {
  function_name = aws_lambda_function.api.function_name
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # The /*/*/* part allows invocation from any stage, method and resource path
  # within API Gateway REST API.
  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*/*"
}
