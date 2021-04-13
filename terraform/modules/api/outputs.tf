output "invoke_url" {
  # @TODO can we get the URL better here? Can we use the ARN or something?
  value       = trim(aws_apigatewayv2_stage.default.invoke_url, "https://")
  description = "URL for invoking / accessing the API through API gateway"
}

output "lambda_function_names" {
  value = [for lambda_function in local.all_lambda_functions : lambda_function.name]
}