# Execution role for API Lambda
resource "aws_iam_role" "lambda" {
  name        = "${var.project_id}_${var.environment_id}_api_lambda"
  description = "Grant Lambda API access to required services"

  # Allow Lambda AWS service to assume this role
  assume_role_policy = <<-POLICY
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": "sts:AssumeRole",
          "Principal": {
            "Service": "lambda.amazonaws.com"
          },
          "Sid": ""
        }
      ]
    }
    POLICY
}

resource "aws_iam_policy" "lambda" {
  name        = "${var.project_id}_${var.environment_id}_api_lambda"
  description = "Grant Lambda API access to required services"

  policy = <<-POLICY
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "dynamodb:DeleteItem",
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:Scan",
          "dynamodb:DescribeTable"
        ],
        "Resource": "arn:aws:dynamodb:${var.aws_region}:${var.aws_account_id}:table/${var.dynamodb_table_name}"
      },
      {
        "Effect": "Allow",
        "Action": [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        "Resource": [
          "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/lambda/${local.lambda_name_prefix}*:*",
          "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/lambda/${local.lambda_name_prefix}*:log-stream:*"
        ]
      },
      {
        "Effect": "Allow",
        "Action": [
          "ssm:GetParametersByPath"
        ],
        "Resource": [
          "arn:aws:ssm:${var.aws_region}:${var.aws_account_id}:parameter/${var.project_id}/${var.environment_id}/API/*"
        ]
      },
      {
        "Effect": "Allow",
        "Action": [
          "ssm:PutParameter"
        ],
        "Resource": [
          "arn:aws:ssm:${var.aws_region}:${var.aws_account_id}:parameter/${var.project_id}/${var.environment_id}/API/DataProtection/*"
        ]
      }
    ]
  }
  POLICY
}

resource "aws_iam_role_policy_attachment" "lambda" {
  role       = aws_iam_role.lambda.name
  policy_arn = aws_iam_policy.lambda.arn
}
