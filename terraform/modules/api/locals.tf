locals {
  lambda_name_prefix = "${var.project_id}_${var.environment_id}"

  all_lambda_functions = {
    // Project
    "project_create" = {
      name = "${local.lambda_name_prefix}_project-create"
      handler = "handlers/project/create.handler"
      route_key = "POST /api/project"
    }
    "project_delete" = {
      name = "${local.lambda_name_prefix}_project-delete"
      handler = "handlers/project/delete.handler"
      route_key = "DELETE /api/project/{id}"
    }
    "project_get" = {
      name = "${local.lambda_name_prefix}_project-get"
      handler = "handlers/project/get.handler"
      route_key = "GET /api/project/{id}"
    }
    "project_get_all" = {
      name = "${local.lambda_name_prefix}_project-get-all"
      handler = "handlers/project/get-all.handler"
      route_key = "GET /api/project"
    }
    "project_save" = {
      name = "${local.lambda_name_prefix}_project-save"
      handler = "handlers/project/save.handler"
      route_key = "PUT /api/project/{id}"
    }
    // Task
    "task_create" = {
      name = "${local.lambda_name_prefix}_task-create"
      handler = "handlers/task/create.handler"
      route_key = "POST /api/project/{projectId}/task"
    }
    "task_delete" = {
      name = "${local.lambda_name_prefix}_task-delete"
      handler = "handlers/task/delete.handler"
      route_key = "DELETE /api/project/{projectId}/task/{id}"
    }
    "task_get" = {
      name = "${local.lambda_name_prefix}_task-get"
      handler = "handlers/task/get.handler"
      route_key = "GET /api/project/{projectId}/task/{id}"
    }
    "task_get_all" = {
      name = "${local.lambda_name_prefix}_task-get-all"
      handler = "handlers/task/get-all.handler"
      route_key = "GET /api/project/{projectId}/task"
    }
    "task_save" = {
      name = "${local.lambda_name_prefix}_task-save"
      handler = "handlers/task/save.handler"
      route_key = "PUT /api/project/{projectId}/task/{id}"
    }
  }
}
