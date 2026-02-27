resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${local.base_name}-ssr"
  retention_in_days = 14
  tags              = local.common_tags
}

resource "aws_lambda_function" "ssr" {
  function_name = "${local.base_name}-ssr"
  role          = aws_iam_role.lambda_exec.arn

  filename         = var.lambda_package_path
  source_code_hash = filebase64sha256(var.lambda_package_path)

  runtime = "nodejs20.x"
  handler = "lambda/handler.handler"

  memory_size = var.lambda_memory_size
  timeout     = var.lambda_timeout

  environment {
    variables = {
      NODE_ENV               = "production"
      ORIGIN                 = "https://${var.domain_name}"
      SSM_ENV_PARAMETER_NAME = var.ssm_env_parameter_name
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda,
    aws_iam_role_policy_attachment.lambda_basic_execution
  ]

  tags = local.common_tags
}

resource "aws_lambda_function_url" "ssr" {
  function_name      = aws_lambda_function.ssr.function_name
  authorization_type = "NONE"
}

resource "aws_lambda_permission" "ssr_function_url_public" {
  statement_id           = "AllowPublicInvokeFunctionUrl"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.ssr.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}

resource "aws_lambda_permission" "ssr_invoke_via_function_url_public" {
  statement_id  = "AllowPublicInvokeFunction"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ssr.function_name
  principal     = "*"
}
