variable "aws_region" {
  description = "Primary AWS region for app resources."
  type        = string
  default     = "us-east-2"
}

variable "project_name" {
  description = "Short project name for tagging and resource names."
  type        = string
  default     = "portfolio"
}

variable "environment" {
  description = "Environment name (e.g. dev, prod)."
  type        = string
  default     = "prod"
}

variable "domain_name" {
  description = "Apex domain name (e.g. matthewkolnicki.com)."
  type        = string
}

variable "create_www_record" {
  description = "Whether to create and attach www.<domain> as an alias."
  type        = bool
  default     = true
}

variable "route53_zone_id" {
  description = "Hosted zone ID for the apex domain."
  type        = string
}

variable "lambda_package_path" {
  description = "Path to pre-built Lambda zip package."
  type        = string
  default     = "../../dist/lambda.zip"
}

variable "lambda_memory_size" {
  description = "Lambda memory size in MB."
  type        = number
  default     = 1024
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds."
  type        = number
  default     = 28
}

variable "ssm_env_parameter_name" {
  description = "SSM SecureString parameter name containing a JSON object of runtime env vars."
  type        = string
  default     = "/portfolio/prod/runtime-env"
}

variable "tags" {
  description = "Additional tags for all resources."
  type        = map(string)
  default     = {}
}
