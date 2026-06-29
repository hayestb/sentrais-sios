# NFLIT 360 Production Package - Reconciliation Guide

## Overview

This guide establishes GitHub as the **single source of truth** for the NFLIT 360 platform, with automated deployments to AWS (backend) and Vercel (web frontend).

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GitHub Repository                            │
│                    (Single Source of Truth)                          │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   /infra    │  │   /backend  │  │    /web     │  │    /ios     │ │
│  │ Terraform/  │  │  MCP Server │  │  React App  │  │  SwiftUI    │ │
│  │ CloudForm   │  │  (Node.js)  │  │  (Vite)     │  │  App        │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
└─────────┼────────────────┼────────────────┼────────────────┼────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │  AWS Infra   │ │  AWS Lambda  │ │   Vercel     │ │  TestFlight  │
   │  (DynamoDB,  │ │  or ECS      │ │  (Auto-      │ │  (Manual     │
   │  S3, Cognito)│ │  (MCP API)   │ │  Deploy)     │ │  Upload)     │
   └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Recommended Repository Structure

```
nflit360/
├── .github/
│   └── workflows/
│       ├── deploy-backend.yml      # AWS deployment on push to main
│       ├── deploy-web.yml          # Vercel deployment (auto via integration)
│       └── test.yml                # Run tests on PR
│
├── infra/                          # Infrastructure as Code
│   ├── terraform/                  # Terraform modules (recommended)
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── modules/
│   │   │   ├── dynamodb/
│   │   │   ├── cognito/
│   │   │   ├── s3/
│   │   │   └── api-gateway/
│   │   └── environments/
│   │       ├── dev.tfvars
│   │       ├── staging.tfvars
│   │       └── prod.tfvars
│   │
│   └── cloudformation/             # Alternative: CloudFormation
│       └── nflit360-stack.yaml
│
├── backend/                        # MCP Server
│   ├── src/
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── README.md
│
├── web/                            # React Web Application
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── README.md
│
├── ios/                            # iOS Application
│   ├── NFLIT360/
│   │   ├── NFLIT360App.swift
│   │   ├── Models.swift
│   │   ├── APIService.swift
│   │   ├── Assets.xcassets/
│   │   └── Info.plist
│   ├── NFLIT360.xcodeproj/
│   └── README.md
│
├── docs/                           # Documentation
│   ├── architecture/
│   │   ├── system-design.md
│   │   ├── data-model.md
│   │   └── api-reference.md
│   ├── operations/
│   │   ├── runbooks/
│   │   ├── sop/
│   │   └── incident-response.md
│   ├── specifications/
│   │   ├── EVERGAME360_Master_Orchestration_v7.json
│   │   ├── GDA_Playbooks/
│   │   └── System_Specs/
│   └── VERSION_REGISTRY.md
│
├── scripts/                        # Utility scripts
│   ├── bootstrap-infrastructure.sh
│   ├── seed-database.sh
│   ├── export-from-aws.sh
│   └── sync-to-github.sh
│
├── .env.example                    # Environment template
├── .gitignore
├── LICENSE
└── README.md                       # Project overview
```

---

## Step-by-Step Reconciliation Process

### Phase 1: Export Current AWS State

```bash
# 1. Export DynamoDB table schemas and data
aws dynamodb describe-table --table-name NFLIT360-Venues-prod > exports/dynamodb-venues.json
aws dynamodb describe-table --table-name NFLIT360-Tasks-prod > exports/dynamodb-tasks.json
aws dynamodb describe-table --table-name NFLIT360-Evidence-prod > exports/dynamodb-evidence.json
aws dynamodb describe-table --table-name NFLIT360-Incidents-prod > exports/dynamodb-incidents.json
aws dynamodb describe-table --table-name NFLIT360-Users-prod > exports/dynamodb-users.json
aws dynamodb describe-table --table-name NFLIT360-Systems-prod > exports/dynamodb-systems.json
aws dynamodb describe-table --table-name NFLIT360-Milestones-prod > exports/dynamodb-milestones.json
aws dynamodb describe-table --table-name NFLIT360-GDAPlaybooks-prod > exports/dynamodb-playbooks.json

# 2. Export Cognito User Pool configuration
aws cognito-idp describe-user-pool --user-pool-id us-east-1_xp9aUGNER > exports/cognito-pool.json

# 3. Export S3 bucket configuration
aws s3api get-bucket-versioning --bucket nflit360-evidence-prod > exports/s3-config.json

# 4. Document current API endpoints
echo "MCP_URL=https://mcp.nflit360.sentrais.dev" > exports/endpoints.env
```

### Phase 2: Collect Claude Artifacts

All files created during our sessions need to be organized:

| Category | Files | Destination |
|----------|-------|-------------|
| iOS App | NFLIT360App.swift, Models.swift, APIService.swift, DesignTokens.swift | `/ios/NFLIT360/` |
| Web App | App.jsx, main.jsx, index.css, package.json, configs | `/web/` |
| Backend | server.ts, Dockerfile, package.json | `/backend/` |
| Specs | *_v6_1.json, *_v7_0.json files | `/docs/specifications/` |
| Docs | Version registries, deployment guides | `/docs/` |
| Infra | bootstrap scripts, CloudWatch configs | `/infra/` |

### Phase 3: Initialize GitHub Repository

```bash
# 1. Create new repository
gh repo create nflit360 --private --description "NFL IT 360 - Game Day Technology Operations Platform"

# 2. Clone locally
git clone https://github.com/YOUR_ORG/nflit360.git
cd nflit360

# 3. Create directory structure
mkdir -p .github/workflows infra/terraform backend/src web/src ios/NFLIT360 docs/specifications scripts

# 4. Copy files to appropriate locations
# (Use the file mapping above)

# 5. Initial commit
git add .
git commit -m "Initial commit: NFLIT 360 v7.0.0 production package"
git push origin main
```

### Phase 4: Set Up CI/CD

#### GitHub Actions for AWS Backend (.github/workflows/deploy-backend.yml)

```yaml
name: Deploy Backend to AWS

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - 'infra/**'

env:
  AWS_REGION: us-east-1

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Build
        run: |
          cd backend
          npm run build
      
      - name: Deploy to ECS/Lambda
        run: |
          # Add your deployment commands here
          echo "Deploying to AWS..."
```

#### Vercel Integration (Automatic)

1. Go to https://vercel.com/dashboard
2. Import the `nflit360` repository
3. Set root directory to `web`
4. Vercel auto-deploys on every push to main

### Phase 5: Configure Secrets

Add these secrets to GitHub repository settings:

| Secret Name | Description |
|-------------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `COGNITO_USER_POOL_ID` | us-east-1_xp9aUGNER |
| `COGNITO_CLIENT_ID` | 1ho0pom8bidnmd66avtdh36e1u |
| `MCP_API_URL` | https://mcp.nflit360.sentrais.dev |

---

## Version Control Strategy

### Branching Model

```
main (production)
  │
  ├── develop (staging)
  │     │
  │     ├── feature/team-management
  │     ├── feature/evidence-upload
  │     └── fix/login-redirect
  │
  └── release/v7.1.0
```

### Commit Message Convention

```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore
Scopes: web, ios, backend, infra, docs

Examples:
- feat(web): add NFL Lead approvals page
- fix(ios): resolve camera permissions issue
- docs(specs): update GDA playbook v7.0
- infra(terraform): add CloudWatch alarms
```

### Tagging Releases

```bash
# Tag production releases
git tag -a v7.0.0 -m "Production release: Full NFL Lead experience"
git push origin v7.0.0
```

---

## Current Asset Inventory

### AWS Resources (Deployed)

| Resource | Name/ID | Status |
|----------|---------|--------|
| Region | us-east-1 | ✅ Active |
| DynamoDB | 8 tables (NFLIT360-*-prod) | ✅ Active |
| S3 | nflit360-evidence-prod | ✅ Active |
| Cognito Pool | us-east-1_xp9aUGNER | ✅ Active |
| Cognito Client | 1ho0pom8bidnmd66avtdh36e1u | ✅ Active |
| MCP Server | mcp.nflit360.sentrais.dev | ✅ Active |

### Vercel Resources (Deployed)

| Resource | URL | Status |
|----------|-----|--------|
| Web App | nflit360-web.vercel.app | ✅ Active |
| Project | novatel-abs/nflit360-web | ✅ Active |

### Claude Artifacts (To Migrate)

| Artifact | Version | Location |
|----------|---------|----------|
| iOS App | v2.0 | NFLIT360App-v2.swift |
| Web App | v3.0 | nflit360-web-v3.zip |
| MCP Server | v2.0.0 | server.ts, Dockerfile |
| Specs | v6.1/v7.0 | Project files |

---

## Migration Checklist

### Pre-Migration
- [ ] Create GitHub repository
- [ ] Set up branch protection rules
- [ ] Configure repository secrets
- [ ] Connect Vercel to repository

### AWS Export
- [ ] Export DynamoDB schemas
- [ ] Export Cognito configuration
- [ ] Document S3 bucket settings
- [ ] Export CloudWatch dashboards
- [ ] Export API Gateway configuration

### Code Migration
- [ ] Copy iOS app files to /ios
- [ ] Copy web app files to /web
- [ ] Copy backend files to /backend
- [ ] Copy infrastructure scripts to /infra
- [ ] Copy specifications to /docs

### CI/CD Setup
- [ ] Create GitHub Actions workflows
- [ ] Test backend deployment pipeline
- [ ] Verify Vercel auto-deployment
- [ ] Configure environment variables

### Validation
- [ ] Test web app from GitHub deployment
- [ ] Test backend API endpoints
- [ ] Verify iOS app builds from repo
- [ ] Run integration tests

### Documentation
- [ ] Update README with setup instructions
- [ ] Document API endpoints
- [ ] Create runbooks for operations
- [ ] Update version registry

---

## Quick Start Commands

```bash
# Clone and setup
git clone https://github.com/YOUR_ORG/nflit360.git
cd nflit360

# Backend local development
cd backend
npm install
npm run dev

# Web local development
cd web
npm install
npm run dev

# iOS development
cd ios
open NFLIT360.xcodeproj

# Deploy infrastructure (Terraform)
cd infra/terraform
terraform init
terraform plan -var-file=environments/prod.tfvars
terraform apply -var-file=environments/prod.tfvars
```

---

## Support Contacts

| Role | Contact |
|------|---------|
| Platform Lead | TBD |
| AWS Admin | TBD |
| Sentrais Architect | Change Control Authority |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 12, 2025 | Claude/Tye | Initial reconciliation guide |
