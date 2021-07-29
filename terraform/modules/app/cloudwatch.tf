# CloudFront Functions
resource "aws_cloudwatch_log_group" "wwwproxy" {
  name              = "/aws/cloudfront/function/${local.wwwproxy_function_name}"
  retention_in_days = 14
}
