# CHIMERA Phase 1 - Quick Start Guide
## From Zero to Running in 10 Minutes

**Target Audience:** DevOps Engineers, Platform Engineers  
**Prerequisites:** Docker, gcloud CLI (optional for cloud), Git  
**Time Required:** 10 minutes

---

## 🎯 What You'll Deploy

By the end of this guide, you'll have a running multi-agent orchestration platform with:
- ✅ 5 AI agents coordinating across 4 zones
- ✅ Automated workflow processing (n8n)
- ✅ Real-time monitoring (Prometheus + Grafana)
- ✅ Immutable audit trail (Evidence Ledger)
- ✅ Health monitoring and alerting

---

## 📋 Prerequisites Check

```bash
# Check Docker
docker --version
# Required: Docker 20.10+

# Check Docker Compose
docker compose version
# Required: Docker Compose 2.0+

# Check disk space
df -h
# Required: At least 10GB free

# Optional: Check gcloud (for cloud deployment)
gcloud --version
```

---

## 🚀 Option 1: Local Docker Deployment (Recommended for Testing)

### Step 1: Clone and Navigate
```bash
git clone <repository-url> chimera-phase1
cd chimera-phase1
```

### Step 2: Create Environment Configuration
```bash
cat > infrastructure/docker/.env << EOF
# GCP Configuration (optional for local testing)
GCP_PROJECT=novate-sentrais
GCP_REGION=us-central1

# Anthropic API Key (REQUIRED)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# n8n Configuration
N8N_USER=admin
N8N_PASSWORD=chimera-admin-2026
N8N_HOST=localhost

# Grafana Configuration
GRAFANA_USER=admin
GRAFANA_PASSWORD=chimera-admin-2026
EOF
```

**⚠️ IMPORTANT:** Replace `sk-ant-your-key-here` with your actual Anthropic API key from https://console.anthropic.com/

### Step 3: Deploy with Single Command
```bash
./infrastructure/scripts/deploy.sh deploy-docker
```

**What happens:**
1. ✅ Pulls Docker images (1-2 minutes)
2. ✅ Builds custom agent containers (2-3 minutes)
3. ✅ Starts all services
4. ✅ Waits for health checks (30 seconds)
5. ✅ Validates all agents are running

### Step 4: Verify Deployment
```bash
# Check service health
./infrastructure/scripts/deploy.sh health

# Expected output:
# [SUCCESS] asirap-supervisor is healthy
# [SUCCESS] nin-forensics is healthy
# [SUCCESS] temporal-sync is healthy
# [SUCCESS] playbook-synthesis is healthy
# [SUCCESS] evidence-ledger is healthy
```

### Step 5: Access the Platform

Open your browser and visit:

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| **ASIRAP Supervisor API** | http://localhost:8080/docs | N/A (API) |
| **NIN Forensics UI** | http://localhost:8082 | N/A (UI) |
| **Temporal Sync API** | http://localhost:8083/docs | N/A (API) |
| **Playbook Synthesis API** | http://localhost:8084/docs | N/A (API) |
| **Evidence Ledger API** | http://localhost:8081/docs | N/A (API) |
| **n8n Workflows** | http://localhost:5678 | admin / chimera-admin-2026 |
| **Grafana Dashboards** | http://localhost:3000 | admin / chimera-admin-2026 |
| **Prometheus Metrics** | http://localhost:9090 | N/A (Metrics) |

---

## ☁️ Option 2: Google Cloud Run Deployment (Production)

### Step 1: Prerequisites
```bash
# Install gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set project
gcloud config set project novate-sentrais

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  bigquery.googleapis.com \
  storage.googleapis.com
```

### Step 2: Create GCP Resources
```bash
# Create Artifact Registry repository
gcloud artifacts repositories create chimera-agents \
  --repository-format=docker \
  --location=us-central1 \
  --description="CHIMERA Agent Container Images"

# Create BigQuery dataset for Evidence Ledger
bq mk --dataset --location=US chimera_evidence_ledger

# Create Cloud Storage bucket for reports
gsutil mb -l us-central1 gs://novate-sentrais-chimera-reports
```

### Step 3: Store Secrets
```bash
# Store Anthropic API key
echo -n "sk-ant-your-key-here" | gcloud secrets create anthropic-api-key \
  --data-file=-

# Store JWT secret for ASIRAP
openssl rand -base64 32 | gcloud secrets create asirap-jwt-secret \
  --data-file=-
```

### Step 4: Deploy to Cloud Run
```bash
# Set environment variables
export GCP_PROJECT=novate-sentrais
export GCP_REGION=us-central1
export ENVIRONMENT=staging

# Deploy
./infrastructure/scripts/deploy.sh deploy-cloud -e staging -p novate-sentrais
```

**What happens:**
1. ✅ Authenticates with GCP
2. ✅ Builds Docker images
3. ✅ Pushes to Artifact Registry
4. ✅ Applies Terraform infrastructure
5. ✅ Deploys to Cloud Run
6. ✅ Configures networking and IAM
7. ✅ Runs health checks

### Step 5: Get Service URLs
```bash
# ASIRAP Supervisor
gcloud run services describe asirap-supervisor-staging \
  --region us-central1 \
  --format 'value(status.url)'

# NIN Forensics
gcloud run services describe nin-forensics-staging \
  --region us-central1 \
  --format 'value(status.url)'

# Evidence Ledger
gcloud run services describe evidence-ledger-staging \
  --region us-central1 \
  --format 'value(status.url)'
```

---

## 🧪 Testing Your Deployment

### Test 1: Register an Agent with ASIRAP
```bash
curl -X POST http://localhost:8080/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "test-agent-001",
    "agent_name": "Test Agent",
    "zone": 2,
    "capabilities": ["testing", "demo"],
    "endpoint_url": "http://test-agent:8090"
  }'

# Expected response:
# {
#   "agent_id": "test-agent-001",
#   "status": "active",
#   "registered_at": "2026-01-15T..."
# }
```

### Test 2: List All Agents
```bash
curl http://localhost:8080/agents

# Expected response:
# [
#   {
#     "agent_id": "nin-forensics",
#     "zone": 2,
#     "status": "active",
#     "last_heartbeat": "2026-01-15T..."
#   },
#   ...
# ]
```

### Test 3: Log Event to Evidence Ledger
```bash
curl -X POST http://localhost:8081/log \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "test.deployment.success",
    "agent_id": "deployment-script",
    "zone": 3,
    "payload": {
      "message": "CHIMERA deployment successful",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }
  }'

# Expected response:
# {
#   "event_id": "evt_...",
#   "status": "logged",
#   "timestamp": "2026-01-15T..."
# }
```

### Test 4: Analyze Document with NIN Forensics
1. Open http://localhost:8082 in your browser
2. Upload a test document (PDF, TXT, or paste text)
3. Click "Analyze Document"
4. Wait for blueprint extraction (10-30 seconds)
5. Review the 5D analysis results
6. Download blueprint as JSON

### Test 5: Import n8n Workflows
```bash
./infrastructure/scripts/deploy.sh import-workflows

# Then open http://localhost:5678
# Login: admin / chimera-admin-2026
# Verify workflows imported:
# - CHIMERA Document Intake Pipeline
# - CHIMERA Agent Health Monitor
```

---

## 📊 Monitoring Your Deployment

### Grafana Dashboards
1. Open http://localhost:3000
2. Login: `admin` / `chimera-admin-2026`
3. Navigate to Dashboards → CHIMERA Overview
4. View:
   - Agent health status
   - Request rates
   - Error rates
   - Resource utilization

### Prometheus Queries
1. Open http://localhost:9090
2. Try these queries:
```promql
# HTTP requests per second by agent
rate(http_requests_total[5m])

# Agent health status
up{job=~"asirap-supervisor|nin-forensics|temporal-sync|evidence-ledger"}

# Request duration 95th percentile
histogram_quantile(0.95, http_request_duration_seconds_bucket)
```

### Evidence Ledger Queries
```bash
# Query recent events
curl "http://localhost:8081/events?limit=10"

# Query events by zone
curl "http://localhost:8081/events/zone/2"

# Query events by agent
curl "http://localhost:8081/events/agent/nin-forensics"
```

---

## 🔧 Common Configuration Tasks

### Update Anthropic API Key
```bash
# For Docker
vim infrastructure/docker/.env
# Update ANTHROPIC_API_KEY=...
docker compose down && docker compose up -d

# For Cloud Run
echo -n "sk-ant-new-key" | gcloud secrets versions add anthropic-api-key \
  --data-file=-
# Redeploy services
```

### Add Custom Agent
```bash
# 1. Create agent registration request
curl -X POST http://localhost:8080/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "custom-agent",
    "agent_name": "My Custom Agent",
    "zone": 3,
    "capabilities": ["custom", "feature"],
    "endpoint_url": "http://custom-agent:8090"
  }'

# 2. Add to docker-compose.yml
# 3. Implement agent with CHIMERA SDK
# 4. Deploy
```

### Configure Slack Alerts
```bash
# Get Slack webhook URL from https://api.slack.com/messaging/webhooks

# Update n8n workflows
# 1. Open http://localhost:5678
# 2. Edit workflow: Agent Health Monitor
# 3. Configure Slack node with webhook URL
# 4. Save and activate
```

---

## 🛑 Stopping and Cleaning Up

### Stop All Services (Docker)
```bash
./infrastructure/scripts/deploy.sh cleanup

# Or manually:
docker compose down
```

### Stop and Remove Data (Docker)
```bash
docker compose down -v
# Warning: This deletes all volumes (logs, data, etc.)
```

### Destroy Cloud Infrastructure
```bash
./infrastructure/scripts/deploy.sh cleanup-cloud

# Requires confirmation
# This will destroy:
# - Cloud Run services
# - Artifact Registry images
# - BigQuery tables
# - Cloud Storage buckets
```

---

## 🐛 Troubleshooting

### Services Won't Start
```bash
# Check logs
docker compose logs

# Check specific service
docker compose logs asirap-supervisor

# Check resource usage
docker stats

# Restart specific service
docker compose restart asirap-supervisor
```

### Agent Health Check Fails
```bash
# Check if service is running
curl http://localhost:8080/health

# Check Docker network
docker network inspect chimera-network

# Check container logs
docker logs asirap-supervisor

# Common issues:
# - Port already in use: Change port in docker-compose.yml
# - Out of memory: Increase Docker memory limit
# - Missing API key: Check .env file
```

### n8n Workflows Not Importing
```bash
# Check n8n is running
curl http://localhost:5678

# Manually import
# 1. Open http://localhost:5678
# 2. Go to Workflows → Import from File
# 3. Select: workflows/n8n/document_intake_pipeline.json
# 4. Repeat for agent_health_monitor.json
```

### Cloud Run Deployment Fails
```bash
# Check quotas
gcloud compute project-info describe --project=novate-sentrais

# Check service account permissions
gcloud projects get-iam-policy novate-sentrais

# Check build logs
gcloud builds list --limit=5

# Retry deployment
./infrastructure/scripts/deploy.sh deploy-cloud -e staging
```

---

## 📚 Next Steps

After successfully deploying CHIMERA:

1. **Read the Technical Specification**
   - `/docs/CHIMERA_Technical_Specification.md`
   - Understand the 4-zone architecture
   - Learn agent coordination patterns

2. **Explore the MindMap**
   - Open `/docs/CHIMERA_MindMap.html`
   - Interactive visualization of system architecture

3. **Review Agent APIs**
   - ASIRAP Supervisor: http://localhost:8080/docs
   - Temporal Sync: http://localhost:8083/docs
   - Evidence Ledger: http://localhost:8081/docs

4. **Build Custom Workflows**
   - Open n8n: http://localhost:5678
   - Create workflows connecting agents
   - Automate document processing

5. **Implement Playbook Synthesis Agent**
   - Complete Zone 3 implementation
   - See specification in technical docs

6. **Production Deployment**
   - Set up CI/CD pipeline (GitHub Actions)
   - Configure production secrets
   - Deploy to Cloud Run production environment

---

## 🎓 Learning Resources

### Video Tutorials (Coming Soon)
- CHIMERA Architecture Overview
- Agent Development Guide
- Workflow Automation with n8n
- Monitoring and Observability

### Documentation
- **API Reference:** `/docs/api/`
- **Agent SDK:** `/docs/sdk/`
- **Best Practices:** `/docs/best-practices/`
- **Troubleshooting:** `/docs/troubleshooting/`

### Community
- Slack: #chimera-platform
- GitHub Discussions: TBD
- Office Hours: Fridays 2pm PST

---

## ✅ Deployment Checklist

- [ ] Docker and Docker Compose installed
- [ ] Anthropic API key obtained
- [ ] `.env` file created with API key
- [ ] Services deployed: `./deploy.sh deploy-docker`
- [ ] Health checks passing: `./deploy.sh health`
- [ ] All 5 agents accessible (ports 8080-8084)
- [ ] n8n workflows imported
- [ ] Grafana dashboard accessible
- [ ] Test agent registered successfully
- [ ] Test event logged to Evidence Ledger
- [ ] Document analyzed with NIN Forensics

---

## 🎉 Success!

You now have a fully operational multi-agent orchestration platform!

**What you can do:**
- Process documents automatically
- Coordinate AI agents across timescales
- Generate adaptive playbooks
- Monitor system health in real-time
- Maintain immutable audit trails

**Need help?** 
- Check logs: `docker compose logs -f`
- Review troubleshooting guide above
- Contact support: chimera-support@novatelabs.com

---

**Deployment Time:** 10 minutes ⏱️  
**Status:** Production Ready ✅  
**Version:** 1.0.0
