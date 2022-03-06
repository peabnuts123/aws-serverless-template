# Copy or rename this file to `terraform.tfvars` and fill in the values below
# e.g. `cp example.tfvars terraform.tfvars`

# - REQUIRED -
# General
# AWS region to create resources in (unless not available)
aws_region = "us-east-1"
# Unique identifier for this project. All resources will be tagged with this id. Also used for naming resources.
# Must be a simple A-Z0-9 string with optional dashes (-)
# e.g. "my-project"
project_id = "my-project"
# Unique environment identifier. All resources will be tagged with this id. Also used for naming resources.
# Must be a simple A-Z0-9 string with optional dashes (-)
# e.g. dev
environment_id = "dev"

# - OPTIONAL -
# URL alias for this environment e.g. something.foo.com
# @NOTE needs to be MANUALLY set up and validated in ACM
# domain_name = ""
