# Copy or rename this file to `terraform.tfvars` and fill in the values below
# e.g. `cp example.tfvars terraform.tfvars`

# Access config
aws_access_key       = "local_access_key" # localstack accepts any access key
aws_secret_key       = "local_acces_key" # localstack accepts any secret key

# General
# AWS region to create resources in (unless not available)
aws_region = "us-east-1"
# Must be a simple A-Z0-9 string with optional dashes (-) or underscores (_)
# e.g. "my-project"
project_id = "my-project"
# Unique environment identifier. All resources will be tagged with this id. Also used for naming resources.
# Must be a simple A-Z0-9 string with optional dashes (-) or underscores (_)
# e.g. dev
environment_id = "local"
