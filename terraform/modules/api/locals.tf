locals {
  lambda_name_prefix = "${var.project_id}_${var.environment_id}"

  lambda_function = {
    name = "${local.lambda_name_prefix}_api"
    handler = "MyProject.Web"
    route_key = "ANY /api/{proxy+}"
  }
}
