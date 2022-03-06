# DATA
# Certificate from ACM - this is configured (once) by hand on the AWS website
data "aws_acm_certificate" "default" {
  count    = var.domain_name != null ? 1 : 0 # Optional - based on `domain_name`
  provider = aws.us_east_1
  domain   = var.domain_name
}
