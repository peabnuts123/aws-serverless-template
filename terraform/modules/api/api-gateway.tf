# API Gateway
resource "aws_apigatewayv2_api" "api" {
  name          = "${var.project_id} (${var.environment_id})"
  protocol_type = "HTTP"
}

# Default stage, auto-deploy
# @NOTE no need for other stages, as separate environments will be
#   entirely separate deployments of this whole infrastructure.
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}


# Lambda integrations
resource "aws_apigatewayv2_integration" "api" {
  api_id      = aws_apigatewayv2_api.api.id
  description = "Proxy to API Lambda"

  integration_type       = "AWS_PROXY"
  # @TODO VPC, probably
  connection_type        = "INTERNET"
  integration_method     = "POST"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}
# Lambda routes
resource "aws_apigatewayv2_route" "api" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = local.lambda_function.route_key
  target    = "integrations/${aws_apigatewayv2_integration.api.id}"
}
