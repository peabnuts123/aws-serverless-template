output "invoke_url" {
  # @TODO can we get the URL better here? Can we use the ARN or something?
  value       = trim(aws_apigatewayv2_stage.default.invoke_url, "https://")
  description = "URL for invoking / accessing the API through API gateway"
}

output "lambda_function" {
  value = local.lambda_function
}
