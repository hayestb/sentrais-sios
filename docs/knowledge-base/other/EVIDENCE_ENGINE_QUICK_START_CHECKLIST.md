# EVIDENCE CAPTURE ENGINE - QUICK START GUIDE
## Secure Build Implementation Checklist

**Project**: EVERGAME Evidence Capture Engine  
**Target**: Simulation-Ready Build with Production Security  
**Timeline**: 9 Weeks to Production

---

## â³ PRE-BUILD CHECKLIST (Week 0)

### GitHub Organization Setup
- [ ] Create GitHub Organization: `NOVATELABS-EVERGAME` (Private)
- [ ] Enable Two-Factor Authentication (2FA) for all team members
- [ ] Configure SSO/SAML integration (if using corporate identity provider)
- [ ] Set up billing and usage limits

### Team Access & Permissions
- [ ] Create GitHub Teams:
  - [ ] `core-platform` (Admin access)
  - [ ] `evidence-engineers` (Write: evidence-engine repo)
  - [ ] `mobile-developers` (Write: ios-client repo)
  - [ ] `infrastructure` (Write: infra repo)
  - [ ] `simulation-testers` (Read: simulations repo)
  - [ ] `executives` (Read-only: All repos)

### Security Tools Setup
- [ ] Snyk account + GitHub integration
- [ ] GitGuardian account + API key
- [ ] Trivy setup (open-source, no account needed)
- [ ] Dependabot enabled (automatic via GitHub)

### AWS Infrastructure
- [ ] Create AWS account (or use existing)
- [ ] Set up IAM role for GitHub Actions deployments (OIDC)
- [ ] Create S3 bucket: `evergame-evidence-production`
  - [ ] Enable versioning
  - [ ] Enable encryption (SSE-KMS)
  - [ ] Enable Object Lock (Governance mode, 7-year retention)
- [ ] Create RDS PostgreSQL 15 instance
- [ ] Create ElastiCache Redis cluster
- [ ] Create EKS cluster (for production deployment)

### Developer Workstation Setup
- [ ] Install Git + configure GPG signing
- [ ] Install Docker Desktop
- [ ] Install Python 3.11+
- [ ] Install Node.js 20+
- [ ] Install Xcode (for iOS development)
- [ ] Install kubectl + AWS CLI
- [ ] Clone repositories

---

## ðŸ"§ REPOSITORY INITIALIZATION SCRIPT

Save this as `init_repositories.sh` and run it to create all repos:

```bash
#!/bin/bash
set -e

ORG="NOVATELABS-EVERGAME"
echo "Initializing EVERGAME repositories in organization: $ORG"

# Function to create repository
create_repo() {
    REPO_NAME=$1
    REPO_DESC=$2
    
    echo "Creating repository: $REPO_NAME"
    
    gh repo create "$ORG/$REPO_NAME" \
        --private \
        --description "$REPO_DESC" \
        --disable-wiki \
        --disable-issues
    
    echo "âœ… $REPO_NAME created"
}

# Create all repositories
create_repo "evergame-360-core" "EVERGAME 360 Core orchestration platform"
create_repo "evergame-evidence-engine" "Evidence capture and storage engine"
create_repo "nfl-ios-client" "NFL iOS mobile client for field operations"
create_repo "nin-forensics-framework" "NIN forensic governance framework"
create_repo "evergame-shared-types" "Shared TypeScript/Python type definitions"
create_repo "evergame-infrastructure" "Terraform and Kubernetes infrastructure as code"
create_repo "evergame-simulations" "Simulation and testing framework"

echo ""
echo "============================================="
echo "âœ… All repositories created successfully!"
echo "============================================="
echo ""
echo "Next steps:"
echo "1. Clone repositories: gh repo clone $ORG/evergame-evidence-engine"
echo "2. Set up branch protection rules (see checklist)"
echo "3. Configure GitHub Secrets (see checklist)"
echo "4. Push initial code and CI/CD workflows"
```

**Run the script:**
```bash
chmod +x init_repositories.sh
./init_repositories.sh
```

---

## 🔐 GITHUB SECRETS CONFIGURATION

### Organization-Level Secrets (Settings > Secrets and variables > Actions)

```bash
# Add organization secrets
gh secret set AWS_DEPLOYMENT_ROLE_ARN \
    --org NOVATELABS-EVERGAME \
    --body "arn:aws:iam::123456789012:role/EvidenceEngineDeployRole"

gh secret set DOCKERHUB_USERNAME \
    --org NOVATELABS-EVERGAME \
    --body "novatelabs"

gh secret set NPM_REGISTRY_TOKEN \
    --org NOVATELABS-EVERGAME \
    --body "npm_XXXXXXXXXXXXXXXXXXXX"

gh secret set SLACK_WEBHOOK_ALERTS \
    --org NOVATELABS-EVERGAME \
    --body "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX"

gh secret set SNYK_TOKEN \
    --org NOVATELABS-EVERGAME \
    --body "snyk_XXXXXXXXXXXXXXXXXXXX"

gh secret set GITGUARDIAN_API_KEY \
    --org NOVATELABS-EVERGAME \
    --body "gg_XXXXXXXXXXXXXXXXXXXX"
```

### Repository-Level Secrets (Per-Repository)

```bash
# Evidence Engine secrets
gh secret set DATABASE_ENCRYPTION_KEY \
    --repo NOVATELABS-EVERGAME/evergame-evidence-engine \
    --body "$(openssl rand -base64 32)"

gh secret set CLAUDE_API_KEY_PROD \
    --repo NOVATELABS-EVERGAME/evergame-evidence-engine \
    --body "sk-ant-XXXXXXXXXXXXXXXXXXXX"

gh secret set CLAUDE_API_KEY_TEST \
    --repo NOVATELABS-EVERGAME/evergame-evidence-engine \
    --body "sk-ant-XXXXXXXXXXXXXXXXXXXX"

gh secret set CERTIFICATE_SIGNING_KEY \
    --repo NOVATELABS-EVERGAME/evergame-evidence-engine \
    --body "$(openssl rand -base64 32)"

# iOS Client secrets
gh secret set APPLE_APPSTORE_CONNECT_KEY \
    --repo NOVATELABS-EVERGAME/nfl-ios-client \
    --body "$(cat ~/Downloads/AuthKey_XXXXXXXXXX.p8)"
```

---

## 🛡️ BRANCH PROTECTION RULES

### For `main` branch (Production)

```bash
# Apply branch protection via GitHub CLI
gh api repos/NOVATELABS-EVERGAME/evergame-evidence-engine/branches/main/protection \
    --method PUT \
    --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "security-checks",
      "unit-tests",
      "integration-tests",
      "simulation-tests"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismissal_restrictions": {},
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 2,
    "require_last_push_approval": true
  },
  "restrictions": null,
  "required_signatures": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": false
}
EOF
```

**Manual Steps (GitHub UI)**:
1. Go to: Settings > Branches > Add branch protection rule
2. Branch name pattern: `main`
3. Check:
   - âœ… Require a pull request before merging
   - âœ… Require approvals (2)
   - âœ… Dismiss stale reviews
   - âœ… Require review from Code Owners
   - âœ… Require status checks to pass before merging
   - âœ… Require branches to be up to date before merging
   - âœ… Require signed commits
   - âœ… Include administrators
   - âœ… Restrict who can push to matching branches (Leave empty for PR-only)

---

## 📋 DAILY DEVELOPER WORKFLOW

### 1. Starting a New Feature

```bash
# Always start from latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/evidence-upload-optimization

# Make changes...
# (develop, test locally)

# Commit with GPG signature (automatic if configured)
git add .
git commit -m "feat: optimize evidence upload latency"

# Push to remote
git push origin feature/evidence-upload-optimization

# Open Pull Request via GitHub CLI
gh pr create \
    --title "Optimize evidence upload latency" \
    --body "Reduces upload time by 40% through parallel processing" \
    --base main
```

### 2. Code Review Process

**Reviewer Checklist**:
- [ ] Code follows security best practices (no hardcoded secrets)
- [ ] All commits are GPG signed
- [ ] Unit tests cover new functionality
- [ ] Integration tests pass
- [ ] Documentation updated
- [ ] Breaking changes noted in PR description

**Approval**:
```bash
# Approve via CLI
gh pr review <PR_NUMBER> --approve --body "LGTM! Security review passed."
```

### 3. Merging to Main

Once PR has:
- âœ… 2+ approvals
- âœ… All CI checks pass (security, tests, simulation)
- âœ… No merge conflicts
- âœ… Signed commits verified

**Merge via GitHub CLI**:
```bash
gh pr merge <PR_NUMBER> --squash --delete-branch
```

**Automatic Actions After Merge**:
1. GitHub Actions builds Docker image
2. Image pushed to GitHub Container Registry (GHCR)
3. Image signed with Cosign
4. Deployed to staging environment (if `staging` branch)
5. Deployed to production (if `main` branch)
6. Slack notification sent

---

## 🧪 LOCAL TESTING WORKFLOW

### Run Evidence Engine Locally

```bash
# Clone repository
git clone git@github.com:NOVATELABS-EVERGAME/evergame-evidence-engine.git
cd evergame-evidence-engine

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Set up local environment variables
cp .env.example .env
# Edit .env with local credentials

# Start local PostgreSQL + Redis (Docker Compose)
docker-compose up -d postgres redis minio

# Run database migrations
alembic upgrade head

# Start development server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# In another terminal, run tests
pytest tests/ -v --cov=src
```

### Run Full Simulation Locally

```bash
# Build all containers
docker-compose -f docker/docker-compose.simulation.yml build

# Run simulation
docker-compose -f docker/docker-compose.simulation.yml up

# Results will be in ./simulation_results/
cat simulation_results/simulation_summary.json
```

---

## 🚨 INCIDENT RESPONSE PLAYBOOK

### Evidence Tampering Detected

**Severity**: CRITICAL  
**Response Time**: <15 minutes

**Steps**:
1. **Isolate**: Immediately disable affected GDA account
2. **Preserve**: Apply legal hold on ALL evidence from that device
3. **Investigate**: Review custody logs for suspicious access patterns
4. **Notify**: Alert NFL IT Leadership + Legal team
5. **Remediate**: Rotate encryption keys, force re-authentication
6. **Document**: Create incident report with forensic analysis

**Command**:
```bash
# Apply legal hold via API
curl -X POST https://api.evergame.nfl.com/evidence/legal-hold \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"device_id": "iPhone-12345", "reason": "Tampering investigation"}'
```

### Secret Compromise (API Key Leaked)

**Severity**: HIGH  
**Response Time**: <30 minutes

**Steps**:
1. **Rotate**: Immediately rotate compromised secret
2. **Revoke**: Invalidate all existing JWT tokens
3. **Audit**: Review all API calls made with compromised key
4. **Notify**: Alert security team via Slack
5. **Update**: Push new secret to GitHub Secrets + AWS Secrets Manager

**Command**:
```bash
# Rotate Claude API key
gh secret set CLAUDE_API_KEY_PROD \
    --repo NOVATELABS-EVERGAME/evergame-evidence-engine \
    --body "sk-ant-NEW_KEY_HERE"

# Trigger re-deployment to pick up new key
gh workflow run deploy-production.yml
```

---

## 📊 MONITORING & OBSERVABILITY

### Datadog Dashboard Setup

**Metrics to Monitor**:
- `evidence.upload.latency` (P50, P95, P99)
- `evidence.validation.accuracy` (AI classification)
- `evidence.storage.utilization` (S3 bucket size)
- `evidence.integrity.violations` (Hash mismatches)
- `api.rate_limit.exceeded` (Abuse detection)
- `database.connection_pool.exhausted` (Performance)

**Alerts**:
- Evidence upload latency > 5 seconds (P95) → Slack #evergame-ops
- Evidence integrity violation detected → PagerDuty + Slack #evergame-security
- API rate limit exceeded > 100 requests/min → Email NFL IT Lead
- Database CPU > 80% for 5 minutes → Autoscale RDS instance

### Logging Configuration

```python
# src/logging_config.py
import logging
import json
from pythonjsonlogger import jsonlogger

def setup_logging():
    """Configure structured JSON logging for Datadog ingestion"""
    
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # JSON formatter for machine parsing
    formatter = jsonlogger.JsonFormatter(
        fmt='%(asctime)s %(name)s %(levelname)s %(message)s',
        rename_fields={
            'asctime': 'timestamp',
            'name': 'logger',
            'levelname': 'level'
        }
    )
    
    # Console handler
    handler = logging.StreamHandler()
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger
```

---

## âœ… WEEK-BY-WEEK IMPLEMENTATION CHECKLIST

### Week 1: Infrastructure Foundation
- [ ] Day 1-2: GitHub org + repos + teams + branch protection
- [ ] Day 3: AWS account + S3 bucket + RDS + Redis
- [ ] Day 4: CI/CD pipelines (security-checks, unit-tests)
- [ ] Day 5: Local development environment setup

**Deliverable**: All developers can clone repos, run tests locally, and open PRs.

---

### Week 2: Database & Core Services
- [ ] Day 1-2: PostgreSQL schema (evidence_items, custody_log, hash_ledger)
- [ ] Day 3: Database migrations (Alembic)
- [ ] Day 4: Evidence Engine API skeleton (FastAPI)
- [ ] Day 5: Health check endpoints + monitoring

**Deliverable**: Evidence Engine responds to `/health` endpoint.

---

### Week 3: Evidence Upload Pipeline
- [ ] Day 1-2: Evidence upload endpoint (`POST /evidence/upload`)
- [ ] Day 3: SHA-256 hash generation + validation
- [ ] Day 4: S3 integration with presigned URLs
- [ ] Day 5: Unit tests (>80% coverage)

**Deliverable**: Evidence can be uploaded via API with hash verification.

---

### Week 4: Chain of Custody & AI Validation
- [ ] Day 1-2: Chain of custody logging (append-only)
- [ ] Day 3-4: Claude Vision API integration
- [ ] Day 5: AI validation background tasks

**Deliverable**: All evidence uploads trigger AI validation and custody logging.

---

### Week 5: NFL iOS Client (Phase 1)
- [ ] Day 1-2: iOS project setup + SwiftUI views
- [ ] Day 3: Camera integration (AVFoundation)
- [ ] Day 4: Local evidence queue (SQLite)
- [ ] Day 5: Biometric authentication (Face ID)

**Deliverable**: iOS app can capture photos and store them locally.

---

### Week 6: NFL iOS Client (Phase 2)
- [ ] Day 1-2: Background sync to Evidence Engine
- [ ] Day 3: Network monitor + retry logic
- [ ] Day 4: Certificate pinning for API security
- [ ] Day 5: Beta testing with 5 internal users

**Deliverable**: iOS app syncs evidence to backend when online.

---

### Week 7: EVERGAME 360 Integration
- [ ] Day 1-2: Evidence dashboard (React + TypeScript)
- [ ] Day 3: Real-time evidence feed (WebSocket)
- [ ] Day 4: Chain of custody visualization
- [ ] Day 5: Audit report generator (PDF export)

**Deliverable**: EVERGAME 360 displays real-time evidence from all GDAs.

---

### Week 8: Simulation & Testing
- [ ] Day 1-2: Docker Compose simulation environment
- [ ] Day 3: Full game simulation script (12 GDAs, 300 tasks)
- [ ] Day 4: Performance testing (1000 concurrent uploads)
- [ ] Day 5: Evidence integrity validation suite

**Deliverable**: Simulation runs successfully with 98%+ evidence completion.

---

### Week 9: Production Deployment
- [ ] Day 1-2: Kubernetes cluster setup (EKS)
- [ ] Day 3: Blue-green deployment to production
- [ ] Day 4: Monitoring dashboards (Datadog)
- [ ] Day 5: Training for NFL operations staff

**Deliverable**: Evidence Engine live in production, ready for first game.

---

## 🎓 TRAINING RESOURCES

### For Developers
- [ ] [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [ ] [GitHub Actions CI/CD Guide](https://docs.github.com/en/actions)
- [ ] [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [ ] [AWS S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)

### For Operations Staff
- [ ] EVERGAME 360 Dashboard User Guide (TBD)
- [ ] Evidence Capture Field Guide (see project knowledge)
- [ ] Incident Response Playbook (this document)

---

## 📞 SUPPORT CONTACTS

### Technical Issues
- **Email**: devops@novatelabs.com
- **Slack**: #evergame-dev-support
- **On-Call**: PagerDuty escalation (for production incidents)

### Security Incidents
- **Email**: security@novatelabs.com
- **Phone**: +1-XXX-XXX-XXXX (24/7)
- **Slack**: #evergame-security-alerts

### Business/Project Management
- **Project Manager**: [Name] - [email]
- **Product Owner**: [Name] - [email]
- **NFL IT Lead**: [Name] - [email]

---

## 🎯 SUCCESS CRITERIA

### Technical Milestones
- âœ… All repositories created with proper access controls
- âœ… CI/CD pipelines passing for all repos
- âœ… Evidence Engine deployed to production
- âœ… iOS app approved for TestFlight distribution
- âœ… EVERGAME 360 integrated with evidence feed
- âœ… Simulation achieving 98%+ success rate
- âœ… Zero security vulnerabilities in production

### Operational Readiness
- âœ… 10+ GDAs trained on iOS app
- âœ… Incident response playbook reviewed by security team
- âœ… Monitoring dashboards accessible to NFL IT
- âœ… Legal team briefed on chain of custody capabilities
- âœ… Backup and disaster recovery tested

### Business Value
- âœ… Evidence capture time reduced from 5 minutes to <30 seconds
- âœ… Audit preparation time reduced from 40 hours to <5 minutes
- âœ… 100% evidence defensibility in legal proceedings
- âœ… Zero evidence tampering incidents

---

*EVERGAME Evidence Capture Engine - From Code to Production in 9 Weeks*  
*© 2025 NOVATE Labs | Quick Start Guide v1.0*
