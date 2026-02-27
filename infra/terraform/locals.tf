locals {
  base_name = "${var.project_name}-${var.environment}"

  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    },
    var.tags
  )

  static_bucket_name = "${local.base_name}-static-assets"

  aliases = var.create_www_record ? [var.domain_name, "www.${var.domain_name}"] : [var.domain_name]
}
