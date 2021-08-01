# PROVIDERS
provider "aws" {
  region     = var.aws_region
  # @NOTE hard-coded localstack credentials because localstack will accept anything
  access_key = "local_access_key"
  secret_key = "local_acces_key"

  # Overrides for localstack
  s3_force_path_style         = true
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  # @NOTE don't forget to add these to docker-compose too
  endpoints {
    apigateway      = "http://localhost:4578"
    cloudwatchlogs  = "http://localhost:4578"
    iam             = "http://localhost:4578"
    dynamodb        = "http://localhost:4578"
    lambda          = "http://localhost:4578"
    sts             = "http://localhost:4578"
  }
}