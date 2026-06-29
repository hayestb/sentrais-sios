# NFLIT360 Platform - Go-Live Checklist

## ✅ Infrastructure Complete

```
┌─────────────────────────────────────────────────────────────┐
│                     PUBLIC INTERNET                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│         MCP Server (Public ALB - Port 8080)                 │
│         ✅ LIVE                                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                                 ▼
┌─────────────────┐              ┌─────────────────┐
│ Backend Service │              │   AI Service    │
│ ✅ Running 2/2  │              │ ✅ Running 2/2  │
└─────────────────┘              └─────────────────┘
         │                                 │
         └────────────────┬────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              DynamoDB  │  S3  │  Secrets Manager            │
│              ✅ Ready                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Verify & Test (Today)

### 1.1 Test MCP Server Connection

```bash
# Health check
curl http://nflit360-mcp-dev-alb-88766750.us-east-1.elb.amazonaws.com:8080/health

# Expected: {"status": "healthy", "service": "nflit360-mcp", "version": "1.0.0"}
```

### 1.2 Test MCP Tools via Claude

```python
from anthropic import Anthropic

client = Anthropic()

response = client.beta.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=2048,
    messages=[{
        "role": "user",
        "content": "Get the executive dashboard for NFL game day operations"
    }],
    mcp_servers=[{
        "type": "url",
        "url": "http://nflit360-mcp-dev-alb-88766750.us-east-1.elb.amazonaws.com:8080/sse",
        "name": "nflit360-mcp"
    }],
    betas=["mcp-client-2025-04-04"]
)

print(response.content[0].text)
```

### 1.3 Run Integration Tests

```bash
export MCP_ENDPOINT="http://nflit360-mcp-dev-alb-88766750.us-east-1.elb.amazonaws.com:8080/sse"
python test-mcp-integration.py --env dev
```

---

## Phase 2: Data & Security (This Week)

### 2.1 Seed DynamoDB with Playbook Data

```bash
# Upload the 16 GDA playbooks to DynamoDB
aws dynamodb batch-write-item --request-items file://seed-data/dev-seed-data.json
```

### 2.2 Enable HTTPS (Recommended)

```bash
# Request ACM certificate
aws acm request-certificate \
    --domain-name mcp.nflit360.sentrais.com \
    --validation-method DNS \
    --region us-east-1

# After validation, update ALB listener to use HTTPS
```

### 2.3 Configure Custom Domain (Optional)

```bash
# Create Route 53 record pointing to ALB
mcp.nflit360.sentrais.com → nflit360-mcp-dev-alb-88766750.us-east-1.elb.amazonaws.com
```

### 2.4 Deploy CloudWatch Monitoring

```bash
# Create dashboard
aws cloudwatch put-dashboard \
    --dashboard-name nflit360-operations-dev \
    --dashboard-body file://monitoring/cloudwatch-dashboard.json

# Deploy alarms
aws cloudformation create-stack \
    --stack-name nflit360-alarms-dev \
    --template-body file://monitoring/cloudwatch-alarms.yaml \
    --parameters ParameterKey=Environment,ParameterValue=dev \
                 ParameterKey=AlertEmail,ParameterValue=YOUR_EMAIL
```

---

## Phase 3: iOS App (Week 2)

### 3.1 Xcode Setup

1. Create new iOS project "NFLIT360"
2. Copy Swift files from `ios-app/` folder
3. Update `APIService.swift` with your endpoint:

```swift
static let baseURL = "http://nflit360-mcp-dev-alb-88766750.us-east-1.elb.amazonaws.com:8080"
```

### 3.2 TestFlight Deployment

1. Archive build in Xcode
2. Upload to App Store Connect
3. Invite pilot testers

---

## Phase 4: User Onboarding (Week 2-3)

### 4.1 Access Setup by Role

| Role | Access Method | Setup |
|------|---------------|-------|
| NFL Executive | Claude.ai | Share MCP endpoint URL |
| NFL IT Executive | Claude.ai | Share MCP endpoint URL |
| NFL Lead | Claude.ai + iOS | MCP URL + TestFlight invite |
| GDA | iOS App | TestFlight invite + credentials |

### 4.2 Sample Queries to Share

**For Executives:**
- "Give me the executive dashboard"
- "How are we looking for Sunday's games?"
- "Which venues need attention?"

**For IT Teams:**
- "What's the health of all 9 systems?"
- "Why is C2P showing degraded at MetLife?"

**For GDAs:**
- "What are my tasks for M3?"
- "Show me the SVS checklist"
- "Mark task 123 complete"

---

## Quick Reference

### Endpoints

| Service | URL |
|---------|-----|
| MCP Server | `http://nflit360-mcp-dev-alb-88766750.us-east-1.elb.amazonaws.com:8080` |
| Health Check | `/health` |
| MCP SSE | `/sse` |

### AWS Console Links

- [ECS Cluster](https://console.aws.amazon.com/ecs/home?region=us-east-1#/clusters/nflit360-mcp-dev)
- [CloudWatch Logs](https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups)
- [DynamoDB Tables](https://console.aws.amazon.com/dynamodbv2/home?region=us-east-1#tables)

### Common Commands

```bash
# View logs
aws logs tail /ecs/nflit360-mcp-dev --follow

# Force redeploy
aws ecs update-service --cluster nflit360-mcp-dev --service nflit360-mcp-server-dev --force-new-deployment

# Check service status
aws ecs describe-services --cluster nflit360-mcp-dev --services nflit360-mcp-server-dev --query 'services[0].{status:status,running:runningCount,desired:desiredCount}'
```

---

## Go-Live Checklist

### Today
- [ ] Test health endpoint
- [ ] Test MCP connection via Claude
- [ ] Run integration tests
- [ ] Seed DynamoDB with playbook data

### This Week
- [ ] Enable HTTPS
- [ ] Configure custom domain
- [ ] Deploy CloudWatch monitoring
- [ ] Set up alerting

### Week 2
- [ ] Build iOS app in Xcode
- [ ] Deploy to TestFlight
- [ ] Train pilot users
- [ ] Begin pilot at 2 venues

### Week 3
- [ ] Expand to 5 venues
- [ ] Gather feedback
- [ ] Iterate on issues

### Week 4
- [ ] Full production rollout
- [ ] Operations handoff
- [ ] Success! 🎉

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| MCP Response Time | <3s | CloudWatch P95 |
| System Uptime | 99.9% | CloudWatch alarms |
| User Adoption | 80% GDAs | Analytics |
| Task Completion | 90%+ via app | DynamoDB queries |
