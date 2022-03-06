# OUTPUTS - all passthrough from app module
output "aws_region" {
  value = var.aws_region
}
output "api_url" {
  value = module.app.api_url
}
output "lambda_function" {
  value = module.app.lambda_function
}
output "www_bucket_name" {
  value = module.app.www_bucket_name
}
output "cloudfront_domain_name" {
  value = module.app.cloudfront_domain_name
}
output "domain_name" {
  value = module.app.domain_name
}
output "wwwproxy_function" {
  value = module.app.wwwproxy_function
}