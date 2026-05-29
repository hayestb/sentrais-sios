#!/usr/bin/env bash
# GCP infrastructure provisioning for SentraisOS staging.
#
# Run once after `gcloud auth login` and `gcloud config set project novatelabs-converge-dev`.
#
# What this does:
#   1. Creates the Artifact Registry Docker repository
#   2. Grants required IAM roles to the GitHub Actions service account
#   3. Creates / updates all Secret Manager secrets from .env.local
#
# Usage:
#   ./scripts/setup-gcp.sh
#
# Requires: gcloud CLI authenticated, .env.local populated

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────

PROJECT_ID="novatelabs-converge-dev"
REGION="us-central1"
SA="github-actions-deployer@novatelabs-shared-pc.iam.gserviceaccount.com"
AR_REPO="sentrais-sios"
ENV_FILE=".env.local"

# IAM roles required by the deployer service account
ROLES=(
  "roles/run.admin"
  "roles/artifactregistry.writer"
  "roles/cloudsql.client"
  "roles/secretmanager.secretAccessor"
  "roles/iam.serviceAccountUser"
)

# .env.local key → Secret Manager secret name (space-separated pairs, bash 3 compatible)
SECRET_PAIRS=(
  "DATABASE_URL:sentrais-sios-database-url"
  "CLERK_SECRET_KEY:sentrais-sios-clerk-secret"
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:sentrais-sios-clerk-publishable"
  "ENCRYPTION_KEY:sentrais-sios-encryption-key"
  "MONDAY_API_TOKEN:sentrais-sios-monday-token"
  "HUBSPOT_API_KEY:sentrais-sios-hubspot-key"
  "HUBSPOT_WEBHOOK_SECRET:sentrais-sios-hubspot-webhook-secret"
)

# ── Helpers ───────────────────────────────────────────────────────────────────

ok()   { echo "  ✓ $*"; }
warn() { echo "  ⚠ $*"; }
info() { echo "  $*"; }

read_env_value() {
  local key="$1"
  if [[ -f "$ENV_FILE" ]]; then
    grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d'=' -f2- | tr -d '\n'
  fi
}

check_gcloud_auth() {
  if ! gcloud auth print-identity-token &>/dev/null; then
    echo ""
    echo "✗ Not authenticated. Run: gcloud auth login"
    exit 1
  fi
  gcloud config set project "$PROJECT_ID" --quiet
  ok "Authenticated to GCP (project: $PROJECT_ID)"
}

# ── Step 1: Artifact Registry ─────────────────────────────────────────────────

setup_artifact_registry() {
  echo ""
  echo "Artifact Registry"

  if gcloud artifacts repositories describe "$AR_REPO" \
      --location="$REGION" --project="$PROJECT_ID" &>/dev/null; then
    ok "Repository '$AR_REPO' already exists"
  else
    gcloud artifacts repositories create "$AR_REPO" \
      --repository-format=docker \
      --location="$REGION" \
      --project="$PROJECT_ID" \
      --description="SentraisOS application images" \
      --quiet
    ok "Created repository '$AR_REPO' in $REGION"
  fi
}

# ── Step 2: IAM bindings ──────────────────────────────────────────────────────

setup_iam() {
  echo ""
  echo "IAM bindings → $SA"

  for role in "${ROLES[@]}"; do
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
      --member="serviceAccount:$SA" \
      --role="$role" \
      --condition=None \
      --quiet 2>/dev/null
    ok "$role"
  done
}

# ── Step 3: Secret Manager ────────────────────────────────────────────────────

setup_secrets() {
  echo ""
  echo "Secret Manager"

  if [[ ! -f "$ENV_FILE" ]]; then
    warn ".env.local not found — run npm run setup:integrations first, then re-run this script"
    return
  fi

  for pair in "${SECRET_PAIRS[@]}"; do
    env_key="${pair%%:*}"
    secret_name="${pair#*:}"
    value="$(read_env_value "$env_key")"

    if [[ -z "$value" ]]; then
      warn "$env_key not found in .env.local — skipping $secret_name"
      continue
    fi

    if gcloud secrets describe "$secret_name" \
        --project="$PROJECT_ID" &>/dev/null; then
      # Add a new version to the existing secret
      printf '%s' "$value" | gcloud secrets versions add "$secret_name" \
        --project="$PROJECT_ID" \
        --data-file=- \
        --quiet
      ok "Updated $secret_name"
    else
      # Create the secret and its first version
      printf '%s' "$value" | gcloud secrets create "$secret_name" \
        --project="$PROJECT_ID" \
        --data-file=- \
        --replication-policy=automatic \
        --quiet
      ok "Created $secret_name"
    fi

    # Ensure the deployer SA can access this secret
    gcloud secrets add-iam-policy-binding "$secret_name" \
      --project="$PROJECT_ID" \
      --member="serviceAccount:$SA" \
      --role="roles/secretmanager.secretAccessor" \
      --quiet 2>/dev/null
  done
}

# ── Main ──────────────────────────────────────────────────────────────────────

echo ""
echo "SentraisOS — GCP staging setup"
echo "────────────────────────────────"

check_gcloud_auth
setup_artifact_registry
setup_iam
setup_secrets

echo ""
echo "GCP setup complete."
echo ""
echo "Next: add CLOUD_SQL_INSTANCE to GitHub Actions secrets once your"
echo "      Cloud SQL instance is provisioned (format: project:region:instance)."
echo ""
