# AWS deployment (Terraform)

This Terraform stack deploys:

- S3 bucket for static SvelteKit assets (`build/client`)
- Lambda function for SSR responses
- Lambda Function URL as a custom CloudFront origin
- CloudFront distribution with:
  - `/_app/*` routed to S3
  - all other paths routed to Lambda SSR
- ACM certificate (us-east-1) for the custom domain
- Route53 aliases for apex and optional `www`

## Prerequisites

- AWS credentials configured for Terraform + AWS CLI
- Existing Route53 hosted zone for `matthewkolnicki.com`
- `terraform` installed (>= 1.7)
- `zip` installed

## Configure

1. Copy `terraform.tfvars.example` to `terraform.tfvars`.
2. Set at least:
   - `domain_name`
   - `route53_zone_id`
   - `github_token` (optional but recommended)

## Runtime environment via SSM

Lambda loads runtime environment variables from one SSM SecureString parameter at startup.

- Configure `ssm_env_parameter_name` in `terraform.tfvars` (for example `/portfolio/prod/runtime-env`)
- The parameter value must be a JSON object of key/value pairs:

```json
{
  "SANITY_API_READ_TOKEN": "skt...",
  "PUBLIC_SANITY_PROJECT_ID": "d1ta6zzb",
  "PUBLIC_SANITY_DATASET": "production",
  "GITHUB_USERNAME": "mkolnicki",
  "GITHUB_TOKEN": ""
}
```

Use `SecureString` for this parameter.

## Deploy

From project root:

```bash
STATIC_BUCKET=portfolio-prod-static-assets npm run deploy:aws
```

Or manually:

```bash
npm run build
npm run package:lambda
aws s3 sync ./build/client/_app s3://<bucket>/_app --delete --cache-control "public,max-age=31536000,immutable"
aws s3 sync ./build/client s3://<bucket> --delete --exclude "_app/*" --cache-control "public,max-age=300"
terraform -chdir=infra/terraform init
terraform -chdir=infra/terraform apply
```

## Validation checklist

- `terraform -chdir=infra/terraform output cloudfront_domain_name` returns a domain.
- `https://matthewkolnicki.com` returns `200` over HTTPS.
- `https://matthewkolnicki.com/_app/...` serves static assets with long-lived cache headers.
- dynamic pages (for example `/projects`) render and include live GitHub data.
- CloudWatch logs exist under `/aws/lambda/portfolio-prod-ssr`.
