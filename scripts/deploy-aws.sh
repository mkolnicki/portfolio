#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TF_DIR="$ROOT_DIR/infra/terraform"

if [[ -z "${STATIC_BUCKET:-}" ]]; then
  echo "STATIC_BUCKET is required (e.g. portfolio-prod-static-assets)." >&2
  exit 1
fi

echo "Building app..."
cd "$ROOT_DIR"
npm run build

echo "Packaging Lambda artifact..."
npm run package:lambda

echo "Uploading immutable _app assets..."
aws s3 sync "$ROOT_DIR/build/client/_app" "s3://$STATIC_BUCKET/_app" \
  --delete \
  --cache-control "public,max-age=31536000,immutable"

echo "Uploading remaining static assets..."
aws s3 sync "$ROOT_DIR/build/client" "s3://$STATIC_BUCKET" \
  --delete \
  --exclude "_app/*" \
  --cache-control "public,max-age=300"

echo "Applying Terraform..."
cd "$TF_DIR"
terraform init
terraform apply -auto-approve

echo "Deployment complete."
