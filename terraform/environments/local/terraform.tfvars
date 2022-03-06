# Variables for local environment can just be committed to source control
# as they are just used for communicating with localstack.

# General
# AWS region to create resources in (unless not available)
aws_region = "us-east-1"
# Must be a simple A-Z0-9 string with optional dashes (-)
# e.g. "my-project"
project_id = "my-project"
# Unique environment identifier. All resources will be tagged with this id. Also used for naming resources.
# Must be a simple A-Z0-9 string with optional dashes (-)
# e.g. dev
environment_id = "local"
