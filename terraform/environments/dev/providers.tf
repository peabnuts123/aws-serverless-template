# PROVIDERS
provider "aws" {
  region     = var.aws_region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key

  default_tags {
    tags = {
      project = var.project_id
      environment = var.environment_id
    }
  }
}