# NFLIT360 Platform - Completion Checklist

## Current State Assessment

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NFLIT360 PLATFORM ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐   │
│   │   iOS App   │    │   Claude    │    │   Web Dashboard     │   │
│   │  (SwiftUI)  │    │   + MCP     │    │   (Future)          │   │
│   └──────┬──────┘    └──────┬──────┘    └──────────┬──────────┘   │
│          │                  │                      │               │
│          │    HTTPS/REST    │    MCP Protocol      │               │
│          ▼                  ▼                      ▼               │
│   ┌─────────────────────────────────────────────────────────────┐ │
│   │                    API Gateway / ALB                         │ │
│   └─────────────────────────────────────────────────────────────┘ │
│          │                  │                      │               │
│          ▼                  ▼                      ▼               │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐   │
│   │  Backend    │    │ MCP Server  │    │  AI Orchestration   │   │
│   │  Services   │    │  (Python)   │    │    (Python)         │   │
│   │ (TypeScript)│    │             │    │                     │   │
│   └──────┬──────┘    └──────┬──────┘    └──────────┬──────────┘   │
│          │                  │                      │               │
│          └──────────────────┴──────────────────────┘               │
│                             │                                      │
│                             ▼                                      │
│   ┌─────────────────────────────────────────────────────────────┐ │
│   │                    AWS Data Layer                            │ │
│   │   DynamoDB │ S3 │ Secrets Manager │ ElastiCache             │ │
│   └─────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Status

| Component | Code | Deployed | Connected | Status |
|-----------|------|----------|-----------|--------|
| **MCP Server** | ✅ | ✅ | ⏳ | AWS Running |
| **Backend Services** | ✅ | ❌ | - | Ready to Deploy |
| **AI Orchestration** | ✅ | ❌ | - | Ready to Deploy |
| **iOS App** | ✅ | ❌ | - | Ready to Build |
| **Design Docs v6.2** | ✅ | ✅ | ✅ | Complete |
| **Monitoring** | ✅ | ❌ | - | Ready to Deploy |
| **n8n Workflows** | ✅ | ❌ | - | Ready to Import |

---

## PHASE 1: Deploy Core Services (This Week)

### 1.1 Deploy Backend Services API

The backend API (`server.ts`) provides the data layer that MCP and iOS connect to.

```bash
# In AWS CloudShell, navigate to backend-services folder

# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker build -t nflit360-backend .
docker tag nflit360-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/nflit360-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/nflit360-backend:latest

# Deploy via ECS (or add to CloudFormation)
```

**CloudFormation Addition Needed:**
- ECS Service for backend-services
- Target group + ALB listener rule
- DynamoDB tables (if not exists)

### 1.2 Deploy AI Orchestration Service

The AI Orchestration service handles intelligent queries and analysis.

```bash
# Same process as backend
docker build -t nflit360-ai-orchestration .
docker tag nflit360-ai-orchestration:latest $ECR_REPO/nflit360-ai-orchestration:latest
docker push $ECR_REPO/nflit360-ai-orchestration:latest
```

### 1.3 Connect MCP Server to Real Backends

Update MCP Server environment variables:

```bash
# In ECS Task Definition or via AWS Console
BACKEND_API_URL=https://api.nflit360.sentrais.com    # Your deployed backend
AI_SERVICE_URL=https://ai.nflit360.sentrais.com      # Your deployed AI service
```

Then force new deployment:
```bash
aws ecs update-service --cluster nflit360-mcp-dev --service nflit360-mcp-server-dev --force-new-deployment
```

### 1.4 Seed Initial Data

Load playbooks and operational data into DynamoDB:

```bash
# Upload seed data
aws dynamodb batch-write-item --request-items file://seed-data/dev-seed-data.json
```

---

## PHASE 2: iOS App Deployment (Week 2)

### 2.1 Xcode Project Setup

```
1. Create new Xcode project: "NFLIT360"
2. Copy Swift files from ios-app/ folder:
   - NFLIT360App.swift (main app)
   - APIService.swift (API client)
   - Models.swift (data models)
   - DesignTokens.swift (NFL branding)

3. Add dependencies via Swift Package Manager:
   - Alamofire (networking)
   - KeychainSwift (secure storage)
   
4. Configure Info.plist:
   - App Transport Security (allow your API domains)
   - Required device capabilities
```

### 2.2 Configure API Endpoints

In `APIService.swift`, update the base URL:

```swift
// Update for your environment
#if DEBUG
    static let baseURL = "https://api.nflit360.dev.sentrais.com"
#else
    static let baseURL = "https://api.nflit360.sentrais.com"
#endif
```

### 2.3 Apple Developer Setup

```
1. Create App ID in Apple Developer Portal
2. Create provisioning profiles (Development + Distribution)
3. Configure push notification certificates (if needed)
4. Set up TestFlight for beta testing
```

### 2.4 Build and Deploy

```bash
# Build for TestFlight
xcodebuild -scheme NFLIT360 -sdk iphoneos -configuration Release archive

# Upload to App Store Connect
xcrun altool --upload-app -f NFLIT360.ipa -u $APPLE_ID -p $APP_SPECIFIC_PASSWORD
```

---

## PHASE 3: Security & Monitoring (Week 2)

### 3.1 Enable HTTPS Everywhere

```bash
# Request ACM certificates
aws acm request-certificate \
    --domain-name api.nflit360.sentrais.com \
    --validation-method DNS

aws acm request-certificate \
    --domain-name mcp.nflit360.sentrais.com \
    --validation-method DNS

# Update ALB listeners to use certificates
```

### 3.2 Deploy CloudWatch Dashboard

```bash
# Create dashboard from template
aws cloudwatch put-dashboard \
    --dashboard-name nflit360-operations \
    --dashboard-body file://monitoring/cloudwatch-dashboard.json
```

### 3.3 Deploy Alarms

```bash
# Deploy alarm stack
aws cloudformation create-stack \
    --stack-name nflit360-alarms-dev \
    --template-body file://monitoring/cloudwatch-alarms.yaml \
    --parameters ParameterKey=Environment,ParameterValue=dev \
                 ParameterKey=AlertEmail,ParameterValue=ops@sentrais.com
```

### 3.4 Configure API Authentication

```bash
# Store API keys in Secrets Manager
aws secretsmanager put-secret-value \
    --secret-id "nflit360/dev/api-keys" \
    --secret-string '{
        "keys": {
            "ios-app-key": {
                "keyId": "ios-001",
                "tenantId": "nfl",
                "tier": "enterprise",
                "permissions": ["read", "write"],
                "expiresAt": "2026-01-01"
            }
        }
    }'
```

---

## PHASE 4: Integration Testing (Week 2-3)

### 4.1 End-to-End Test Scenarios

| Test | Flow | Expected |
|------|------|----------|
| Dashboard Load | iOS → Backend → DynamoDB | Dashboard displays |
| MCP Query | Claude → MCP → Backend → Response | Natural language works |
| Task Update | iOS → Backend → DynamoDB → MCP notification | Task marked complete |
| Evidence Upload | iOS → S3 → Backend → DynamoDB | Photo stored |

### 4.2 Run Integration Tests

```bash
# MCP integration tests
python test-mcp-integration.py --env dev

# Backend API tests
npm run test:integration

# iOS UI tests (in Xcode)
xcodebuild test -scheme NFLIT360 -destination 'platform=iOS Simulator,name=iPhone 15'
```

### 4.3 Load Testing

```bash
# Install k6
# Run load test against backend
k6 run --vus 50 --duration 5m load-test.js
```

---

## PHASE 5: User Rollout (Week 3-4)

### 5.1 User Access Setup

| Role | Access Method | Setup Required |
|------|---------------|----------------|
| NFL Executive | Claude.ai + MCP | Add to Anthropic org, share MCP URL |
| NFL IT Executive | Claude.ai + MCP | Same as above |
| NFL Lead | Claude.ai + iOS App | MCP access + TestFlight invite |
| GDA | iOS App | TestFlight invite + credentials |

### 5.2 Training Schedule

| Session | Audience | Duration | Content |
|---------|----------|----------|---------|
| Executive Briefing | NFL Executives | 30 min | MCP demo, sample queries |
| IT Deep Dive | NFL IT Team | 1 hour | Architecture, monitoring, troubleshooting |
| Lead Training | NFL Leads | 45 min | MCP + iOS app, playbook review |
| GDA Training | GDAs | 1 hour | iOS app hands-on, task workflow |

### 5.3 Pilot Venues

| Week | Venues | GDAs | Notes |
|------|--------|------|-------|
| 3 | MetLife, SoFi | 4 | Initial pilot |
| 4 | + Arrowhead, Allegiant, Lumen | 10 | Expanded pilot |
| 5 | All 30+ venues | 60+ | Full rollout |

---

## Remaining Work Items

### Infrastructure (Must Do)

| Item | Owner | Est. Hours | Priority |
|------|-------|------------|----------|
| Deploy Backend Services to ECS | DevOps | 4h | P0 |
| Deploy AI Orchestration to ECS | DevOps | 4h | P0 |
| Connect MCP to real backends | DevOps | 1h | P0 |
| Enable HTTPS (ACM certs) | DevOps | 2h | P0 |
| Deploy CloudWatch monitoring | DevOps | 2h | P1 |
| Seed DynamoDB with playbook data | Backend | 2h | P0 |

### iOS App (Must Do)

| Item | Owner | Est. Hours | Priority |
|------|-------|------------|----------|
| Create Xcode project | iOS Dev | 2h | P0 |
| Configure API endpoints | iOS Dev | 1h | P0 |
| Apple Developer setup | iOS Dev | 2h | P0 |
| TestFlight deployment | iOS Dev | 2h | P0 |
| Push notifications (optional) | iOS Dev | 4h | P2 |

### Documentation & Training (Should Do)

| Item | Owner | Est. Hours | Priority |
|------|-------|------------|----------|
| Admin runbook | DevOps | 4h | P1 |
| User training videos | Training | 8h | P1 |
| API documentation | Backend | 4h | P2 |
| Troubleshooting guide | Support | 4h | P2 |

---

## Quick Reference: Deployment Commands

```bash
# ========== Backend Services ==========
cd backend-services
docker build -t nflit360-backend .
docker push $ECR/nflit360-backend:latest
aws ecs update-service --cluster nflit360-dev --service backend --force-new-deployment

# ========== AI Orchestration ==========
cd ai-orchestration
docker build -t nflit360-ai .
docker push $ECR/nflit360-ai:latest
aws ecs update-service --cluster nflit360-dev --service ai-orchestration --force-new-deployment

# ========== MCP Server (already deployed) ==========
# Just update environment variables to point to real backends
aws ecs update-service --cluster nflit360-mcp-dev --service nflit360-mcp-server-dev --force-new-deployment

# ========== Verify Everything ==========
curl https://api.nflit360.dev.sentrais.com/health
curl https://ai.nflit360.dev.sentrais.com/health  
curl https://mcp.nflit360.dev.sentrais.com:8080/health
```

---

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Backend API latency | <200ms P95 | CloudWatch |
| MCP query latency | <3s P95 | CloudWatch |
| iOS app crash rate | <0.1% | Crashlytics |
| Task completion via app | 90%+ | Analytics |
| User satisfaction | 4.5+/5 | Survey |

---

## Timeline Summary

```
Week 1: Infrastructure
├── Day 1-2: Deploy Backend + AI services
├── Day 3: Connect MCP to backends
├── Day 4: Enable HTTPS, monitoring
└── Day 5: Integration testing

Week 2: iOS + Security
├── Day 1-2: Xcode project setup
├── Day 3: Apple Developer config
├── Day 4: TestFlight deployment
└── Day 5: Security hardening

Week 3: Pilot
├── Day 1-2: Training sessions
├── Day 3-5: Pilot at 2 venues
└── Iterate based on feedback

Week 4: Rollout
├── Day 1-2: Expand to 5 venues
├── Day 3-4: Full rollout
└── Day 5: Operations handoff
```
