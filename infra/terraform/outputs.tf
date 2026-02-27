output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "CloudFront DNS name."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "static_bucket_name" {
  description = "S3 bucket storing static assets."
  value       = aws_s3_bucket.static_assets.id
}

output "lambda_function_name" {
  description = "SSR Lambda function name."
  value       = aws_lambda_function.ssr.function_name
}
