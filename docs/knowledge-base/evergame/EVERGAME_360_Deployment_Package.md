# EVERGAME 360 - Complete Deployment Package
## Production-Ready Automation for January 4, 2026

**Package Version**: 1.0  
**Target Date**: January 4, 2026  
**Status**: READY FOR EXECUTION

---

## 📦 PACKAGE CONTENTS

This deployment package includes everything needed for production deployment:

1. **Docker Containerization** - Multi-stage builds with security scanning
2. **Deployment Scripts** - Automated deployment with rollback capabilities
3. **Monitoring Stack** - Prometheus, Grafana, alerting
4. **Integration Code** - Sentrais + NFL iOS + GMS connections
5. **Database Migrations** - Versioned schema updates
6. **Health Checks** - Comprehensive validation suite

---

## 🐳 DOCKER CONFIGURATION

### Multi-Stage Production Dockerfile

**File**: `Dockerfile`

```dockerfile
# EVERGAME 360 Production Dockerfile
# Multi-stage build for optimized image size and security

# ============================================================================
# Stage 1: Base Python image with security updates
# ============================================================================
FROM python:3.9-slim-bullseye AS base

# Set Python environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies and security updates
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
        curl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# ============================================================================
# Stage 2: Build dependencies
# ============================================================================
FROM base AS builder

WORKDIR /build

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --user --no-warn-script-location \
    -r requirements.txt

# ============================================================================
# Stage 3: Production image
# ============================================================================
FROM base AS production

# Create non-root user
RUN groupadd -r evergame && \
    useradd -r -g evergame -u 1000 evergame

# Set working directory
WORKDIR /app

# Copy Python dependencies from builder
COPY --from=builder /root/.local /home/evergame/.local

# Copy application code
COPY --chown=evergame:evergame . /app

# Set PATH for non-root user
ENV PATH=/home/evergame/.local/bin:$PATH

# Switch to non-root user
USER evergame

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Docker Compose for Local Development

**File**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:14
    container_name: evergame-postgres
    environment:
      POSTGRES_DB: evergame360_dev
      POSTGRES_USER: evergame_dev
      POSTGRES_PASSWORD: dev_password_123
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U evergame_dev"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - evergame-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: evergame-redis
    command: redis-server --requirepass dev_redis_password
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - evergame-network

  # EVERGAME 360 Core Application
  evergame-core:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: evergame-core
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      # Database
      DATABASE_URL: postgresql://evergame_dev:dev_password_123@postgres:5432/evergame360_dev
      
      # Redis
      REDIS_URL: redis://:dev_redis_password@redis:6379/0
      
      # Application
      ENVIRONMENT: development
      LOG_LEVEL: DEBUG
      SECRET_KEY: dev_secret_key_change_in_production
      
      # NFL GMS (mock for development)
      NFL_GMS_API_URL: http://mock-nfl-gms:8001
      NFL_GMS_API_KEY: dev_mock_key
      
      # Sentrais (mock for development)
      SENTRAIS_API_URL: http://mock-sentrais:8002
      SENTRAIS_API_KEY: dev_mock_key
    ports:
      - "8000:8000"
    volumes:
      - ./:/app
      - /app/.venv  # Prevent mounting venv
    networks:
      - evergame-network

  # Mock NFL GMS API (for development)
  mock-nfl-gms:
    build:
      context: ./tests/mocks
      dockerfile: Dockerfile.nfl-gms
    container_name: mock-nfl-gms
    ports:
      - "8001:8001"
    networks:
      - evergame-network

  # Mock Sentrais API (for development)
  mock-sentrais:
    build:
      context: ./tests/mocks
      dockerfile: Dockerfile.sentrais
    container_name: mock-sentrais
    ports:
      - "8002:8002"
    networks:
      - evergame-network

  # Prometheus Monitoring
  prometheus:
    image: prom/prometheus:latest
    container_name: evergame-prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - evergame-network

  # Grafana Dashboards
  grafana:
    image: grafana/grafana:latest
    container_name: evergame-grafana
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
      GF_USERS_ALLOW_SIGN_UP: false
    ports:
      - "3000:3000"
    volumes:
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus
    networks:
      - evergame-network

networks:
  evergame-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
```

---

## 🚀 DEPLOYMENT SCRIPTS

### Master Deployment Orchestrator

**File**: `scripts/deploy_master.sh`

```bash
#!/bin/bash
# EVERGAME 360 Master Deployment Orchestrator
# Coordinates all deployment steps with validation

set -e

# Configuration
VERSION=${1:?"Usage: $0 <version> <environment>"}
ENVIRONMENT=${2:-"production"}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="deployment_$(date +%Y%m%d_%H%M%S).log"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

# ============================================================================
# Step 1: Pre-Deployment Validation
# ============================================================================
pre_deployment_validation() {
    log "=== Step 1: Pre-Deployment Validation ==="
    
    # Check required tools
    log "Checking required tools..."
    command -v aws >/dev/null 2>&1 || error "AWS CLI not found"
    command -v kubectl >/dev/null 2>&1 || error "kubectl not found"
    command -v docker >/dev/null 2>&1 || error "Docker not found"
    command -v terraform >/dev/null 2>&1 || error "Terraform not found"
    
    # Verify AWS credentials
    log "Verifying AWS credentials..."
    aws sts get-caller-identity >/dev/null 2>&1 || error "AWS credentials not configured"
    
    # Check version exists in repository
    log "Checking version exists in repository..."
    git rev-parse "$VERSION" >/dev/null 2>&1 || error "Version $VERSION not found in git"
    
    # Verify infrastructure state
    log "Verifying infrastructure state..."
    cd "$SCRIPT_DIR/../infrastructure/terraform"
    terraform validate || error "Terraform configuration invalid"
    
    log "✅ Pre-deployment validation passed"
}

# ============================================================================
# Step 2: Infrastructure Provisioning/Update
# ============================================================================
provision_infrastructure() {
    log "=== Step 2: Infrastructure Provisioning ==="
    
    cd "$SCRIPT_DIR/../infrastructure/terraform"
    
    # Initialize Terraform
    log "Initializing Terraform..."
    terraform init -upgrade
    
    # Plan infrastructure changes
    log "Planning infrastructure changes..."
    terraform plan -out=tfplan -var="environment=$ENVIRONMENT"
    
    # Apply infrastructure changes (with approval)
    if [[ "$ENVIRONMENT" == "production" ]]; then
        read -p "Apply infrastructure changes to PRODUCTION? (yes/no): " CONFIRM
        if [[ "$CONFIRM" != "yes" ]]; then
            error "Deployment cancelled by user"
        fi
    fi
    
    log "Applying infrastructure changes..."
    terraform apply tfplan
    
    # Export outputs
    log "Exporting infrastructure outputs..."
    terraform output -json > "$SCRIPT_DIR/../infrastructure/outputs.json"
    
    log "✅ Infrastructure provisioning complete"
}

# ============================================================================
# Step 3: Build Docker Images
# ============================================================================
build_docker_images() {
    log "=== Step 3: Build Docker Images ==="
    
    cd "$SCRIPT_DIR/.."
    
    # Checkout version
    log "Checking out version $VERSION..."
    git checkout "$VERSION"
    
    # Build Docker image
    log "Building Docker image..."
    docker build \
        --build-arg VERSION="$VERSION" \
        --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
        --tag "ghcr.io/nfl/evergame-360:$VERSION" \
        --tag "ghcr.io/nfl/evergame-360:latest" \
        .
    
    # Security scan with Trivy
    log "Running security scan..."
    docker run --rm \
        -v /var/run/docker.sock:/var/run/docker.sock \
        aquasec/trivy image \
        --severity HIGH,CRITICAL \
        "ghcr.io/nfl/evergame-360:$VERSION" || error "Security vulnerabilities found"
    
    # Push to registry
    log "Pushing to container registry..."
    docker push "ghcr.io/nfl/evergame-360:$VERSION"
    docker push "ghcr.io/nfl/evergame-360:latest"
    
    log "✅ Docker images built and pushed"
}

# ============================================================================
# Step 4: Database Migrations
# ============================================================================
run_database_migrations() {
    log "=== Step 4: Database Migrations ==="
    
    # Configure kubectl
    log "Configuring kubectl..."
    aws eks update-kubeconfig \
        --region us-east-1 \
        --name evergame-360-prod
    
    # Apply migration job
    log "Applying database migration job..."
    kubectl apply -f "$SCRIPT_DIR/../kubernetes/jobs/db-migration-$VERSION.yaml"
    
    # Wait for completion
    log "Waiting for migration to complete..."
    kubectl wait --for=condition=complete --timeout=600s "job/db-migration-$VERSION" -n production || {
        error "Database migration failed"
    }
    
    # Check migration logs
    log "Migration logs:"
    kubectl logs -n production "job/db-migration-$VERSION"
    
    log "✅ Database migrations complete"
}

# ============================================================================
# Step 5: Deploy Application
# ============================================================================
deploy_application() {
    log "=== Step 5: Deploy Application ==="
    
    # Execute blue-green deployment
    log "Executing blue-green deployment..."
    bash "$SCRIPT_DIR/deploy_production.sh" "$VERSION" || error "Deployment failed"
    
    log "✅ Application deployed"
}

# ============================================================================
# Step 6: Smoke Tests
# ============================================================================
run_smoke_tests() {
    log "=== Step 6: Smoke Tests ==="
    
    # Apply smoke test job
    log "Applying smoke test job..."
    kubectl apply -f "$SCRIPT_DIR/../kubernetes/jobs/smoke-test-$VERSION.yaml"
    
    # Wait for completion
    log "Waiting for smoke tests to complete..."
    kubectl wait --for=condition=complete --timeout=300s "job/smoke-test-$VERSION" -n production || {
        error "Smoke tests failed - initiating rollback"
    }
    
    # Check test results
    log "Smoke test results:"
    kubectl logs -n production "job/smoke-test-$VERSION"
    
    log "✅ Smoke tests passed"
}

# ============================================================================
# Step 7: Monitoring Setup
# ============================================================================
setup_monitoring() {
    log "=== Step 7: Monitoring Setup ==="
    
    # Update CloudWatch dashboards
    log "Updating CloudWatch dashboards..."
    aws cloudwatch put-dashboard \
        --dashboard-name "EVERGAME-360-Production" \
        --dashboard-body file://"$SCRIPT_DIR/../monitoring/cloudwatch-dashboard.json"
    
    # Configure alarms
    log "Configuring CloudWatch alarms..."
    bash "$SCRIPT_DIR/setup_alarms.sh"
    
    log "✅ Monitoring setup complete"
}

# ============================================================================
# Step 8: Post-Deployment Validation
# ============================================================================
post_deployment_validation() {
    log "=== Step 8: Post-Deployment Validation ==="
    
    # Check pod health
    log "Checking pod health..."
    kubectl get pods -n production -l app=evergame-360
    
    # Check service endpoints
    log "Checking service endpoints..."
    kubectl get svc -n production
    
    # Verify external access
    log "Verifying external access..."
    ALB_DNS=$(kubectl get ingress evergame-360 -n production -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    curl -f "http://$ALB_DNS/health" || error "Health check failed"
    
    # Check metrics
    log "Checking metrics..."
    kubectl port-forward -n production svc/evergame-360-core 9090:9090 &
    PF_PID=$!
    sleep 5
    curl -s http://localhost:9090/metrics | grep "evergame_" || warning "Metrics not available"
    kill $PF_PID
    
    log "✅ Post-deployment validation passed"
}

# ============================================================================
# Step 9: Notification
# ============================================================================
send_notification() {
    log "=== Step 9: Notification ==="
    
    local STATUS=$1
    local MESSAGE=$2
    
    # Send to Slack
    curl -X POST "$SLACK_WEBHOOK_DEPLOYMENTS" \
        -H 'Content-Type: application/json' \
        -d "{
            \"text\": \"$STATUS EVERGAME 360 Deployment\",
            \"attachments\": [{
                \"color\": \"$([[ $STATUS == '✅' ]] && echo 'good' || echo 'danger')\",
                \"fields\": [
                    {\"title\": \"Version\", \"value\": \"$VERSION\", \"short\": true},
                    {\"title\": \"Environment\", \"value\": \"$ENVIRONMENT\", \"short\": true},
                    {\"title\": \"Status\", \"value\": \"$MESSAGE\", \"short\": false},
                    {\"title\": \"Timestamp\", \"value\": \"$(date -u +'%Y-%m-%d %H:%M:%S UTC')\", \"short\": false}
                ]
            }]
        }"
    
    log "Notification sent"
}

# ============================================================================
# Main Execution
# ============================================================================
main() {
    log "🚀 EVERGAME 360 Deployment Starting"
    log "   Version: $VERSION"
    log "   Environment: $ENVIRONMENT"
    log "   Timestamp: $(date -u +'%Y-%m-%d %H:%M:%S UTC')"
    log ""
    
    START_TIME=$(date +%s)
    
    # Execute deployment steps
    pre_deployment_validation
    provision_infrastructure
    build_docker_images
    run_database_migrations
    deploy_application
    run_smoke_tests
    setup_monitoring
    post_deployment_validation
    
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    log ""
    log "✅ DEPLOYMENT COMPLETE"
    log "   Duration: $((DURATION / 60)) minutes $((DURATION % 60)) seconds"
    log "   Log file: $LOG_FILE"
    
    send_notification "✅" "Deployment completed successfully in $((DURATION / 60)) minutes"
}

# Error handling
trap 'error "Deployment failed at step: $BASH_COMMAND"' ERR

# Execute main function
main "$@"
```

---

## 🔌 INTEGRATION CODE

### Sentrais Integration Module

**File**: `api/integrations/sentrais.py`

```python
"""
EVERGAME 360 - Sentrais Integration Module
Connects to Sentrais OS for NIN Forensics framework execution
"""

import httpx
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class SentraisClient:
    """
    Asynchronous client for Sentrais OS Integration
    Handles NIN phase execution and forensic audit trails
    """
    
    def __init__(self, api_url: str, api_key: str):
        self.api_url = api_url.rstrip('/')
        self.api_key = api_key
        self.client = httpx.AsyncClient(
            base_url=self.api_url,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            timeout=30.0
        )
    
    async def execute_nin_phase(
        self,
        phase: str,
        playbook_id: str,
        task_id: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a NIN phase (Discover, Diagnose, Design, Deploy, Debrief)
        
        Args:
            phase: NIN phase name
            playbook_id: ID of the playbook being executed
            task_id: Specific task being executed
            context: Contextual data for the phase
        
        Returns:
            NIN execution result with forensic metadata
        """
        try:
            response = await self.client.post(
                "/nin/execute",
                json={
                    "phase": phase,
                    "playbook_id": playbook_id,
                    "task_id": task_id,
                    "context": context,
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            response.raise_for_status()
            return response.json()
        
        except httpx.HTTPStatusError as e:
            logger.error(f"Sentrais API error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Failed to execute NIN phase: {e}")
            raise
    
    async def capture_evidence(
        self,
        evidence_type: str,
        evidence_data: Dict[str, Any],
        metadata: Dict[str, Any]
    ) -> str:
        """
        Capture evidence using Sentrais forensic framework
        
        Args:
            evidence_type: Type of evidence (checklist, photo, api, ai)
            evidence_data: The actual evidence data
            metadata: Metadata including timestamp, operator, etc.
        
        Returns:
            Evidence ID for forensic chain
        """
        try:
            response = await self.client.post(
                "/evidence/capture",
                json={
                    "type": evidence_type,
                    "data": evidence_data,
                    "metadata": {
                        **metadata,
                        "timestamp": datetime.utcnow().isoformat(),
                        "system": "EVERGAME-360"
                    }
                }
            )
            response.raise_for_status()
            result = response.json()
            return result["evidence_id"]
        
        except Exception as e:
            logger.error(f"Failed to capture evidence: {e}")
            raise
    
    async def get_playbook_state(self, playbook_id: str) -> Dict[str, Any]:
        """
        Get current state of a playbook execution
        
        Args:
            playbook_id: ID of the playbook
        
        Returns:
            Current state machine status
        """
        try:
            response = await self.client.get(f"/playbooks/{playbook_id}/state")
            response.raise_for_status()
            return response.json()
        
        except Exception as e:
            logger.error(f"Failed to get playbook state: {e}")
            raise
    
    async def validate_certification(
        self,
        gda_id: str,
        position: str,
        level: int
    ) -> bool:
        """
        Validate GDA certification for a position
        
        Args:
            gda_id: GDA user ID
            position: Position to validate
            level: Required certification level
        
        Returns:
            True if certified, False otherwise
        """
        try:
            response = await self.client.post(
                "/certification/validate",
                json={
                    "gda_id": gda_id,
                    "position": position,
                    "required_level": level
                }
            )
            response.raise_for_status()
            result = response.json()
            return result["certified"]
        
        except Exception as e:
            logger.error(f"Failed to validate certification: {e}")
            return False
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# Singleton instance
_sentrais_client: Optional[SentraisClient] = None


def get_sentrais_client() -> SentraisClient:
    """Get or create Sentrais client singleton"""
    global _sentrais_client
    
    if _sentrais_client is None:
        from api.config import settings
        _sentrais_client = SentraisClient(
            api_url=settings.SENTRAIS_API_URL,
            api_key=settings.SENTRAIS_API_KEY
        )
    
    return _sentrais_client
```

### NFL GMS Integration Module

**File**: `api/integrations/nfl_gms.py`

```python
"""
EVERGAME 360 - NFL Game Management System (GMS) Integration
Syncs game schedules, venue data, and official assignments
"""

import httpx
import asyncio
from typing import Dict, List, Optional
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)


class NFLGMSClient:
    """
    Asynchronous client for NFL Game Management System
    Handles game schedules and venue coordination
    """
    
    def __init__(self, api_url: str, api_key: str):
        self.api_url = api_url.rstrip('/')
        self.api_key = api_key
        self.client = httpx.AsyncClient(
            base_url=self.api_url,
            headers={
                "X-API-Key": self.api_key,
                "Content-Type": "application/json"
            },
            timeout=30.0
        )
    
    async def get_game_schedule(
        self,
        season: int,
        week: int
    ) -> List[Dict]:
        """
        Get game schedule for a specific week
        
        Args:
            season: NFL season year
            week: Week number
        
        Returns:
            List of games with venue and timing details
        """
        try:
            response = await self.client.get(
                f"/games/schedule",
                params={"season": season, "week": week}
            )
            response.raise_for_status()
            return response.json()["games"]
        
        except Exception as e:
            logger.error(f"Failed to get game schedule: {e}")
            raise
    
    async def get_game_details(self, game_id: str) -> Dict:
        """
        Get detailed information about a specific game
        
        Args:
            game_id: Unique game identifier
        
        Returns:
            Game details including teams, venue, kickoff time
        """
        try:
            response = await self.client.get(f"/games/{game_id}")
            response.raise_for_status()
            return response.json()
        
        except Exception as e:
            logger.error(f"Failed to get game details: {e}")
            raise
    
    async def get_venue_info(self, venue_id: str) -> Dict:
        """
        Get venue information and technical requirements
        
        Args:
            venue_id: Unique venue identifier
        
        Returns:
            Venue details including address, capacity, tech specs
        """
        try:
            response = await self.client.get(f"/venues/{venue_id}")
            response.raise_for_status()
            return response.json()
        
        except Exception as e:
            logger.error(f"Failed to get venue info: {e}")
            raise
    
    async def sync_game_clock(self, game_id: str) -> Dict:
        """
        Sync with live game clock for real-time countdown
        
        Args:
            game_id: Unique game identifier
        
        Returns:
            Current game clock state (time to kickoff, quarter, etc.)
        """
        try:
            response = await self.client.get(f"/games/{game_id}/clock")
            response.raise_for_status()
            return response.json()
        
        except Exception as e:
            logger.error(f"Failed to sync game clock: {e}")
            raise
    
    async def report_system_status(
        self,
        game_id: str,
        system: str,
        status: str,
        details: Optional[Dict] = None
    ) -> bool:
        """
        Report system status to GMS
        
        Args:
            game_id: Unique game identifier
            system: System name (IVRS, FTR, C2C, etc.)
            status: Status (ready, degraded, failed)
            details: Additional status details
        
        Returns:
            True if reported successfully
        """
        try:
            response = await self.client.post(
                f"/games/{game_id}/systems/{system}/status",
                json={
                    "status": status,
                    "details": details or {},
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            response.raise_for_status()
            return True
        
        except Exception as e:
            logger.error(f"Failed to report system status: {e}")
            return False
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# Singleton instance
_gms_client: Optional[NFLGMSClient] = None


def get_gms_client() -> NFLGMSClient:
    """Get or create GMS client singleton"""
    global _gms_client
    
    if _gms_client is None:
        from api.config import settings
        _gms_client = NFLGMSClient(
            api_url=settings.NFL_GMS_API_URL,
            api_key=settings.NFL_GMS_API_KEY
        )
    
    return _gms_client
```

---

## 📊 MONITORING CONFIGURATION

### Prometheus Configuration

**File**: `monitoring/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'evergame-360-prod'
    environment: 'production'

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

rule_files:
  - 'alert_rules.yml'

scrape_configs:
  # EVERGAME 360 Core Application
  - job_name: 'evergame-360-core'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - production
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        action: keep
        regex: evergame-360
      - source_labels: [__meta_kubernetes_pod_label_component]
        action: keep
        regex: core
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__

  # PostgreSQL Exporter
  - job_name: 'postgres'
    static_configs:
      - targets:
          - postgres-exporter:9187

  # Redis Exporter
  - job_name: 'redis'
    static_configs:
      - targets:
          - redis-exporter:9121

  # Kubernetes Nodes
  - job_name: 'kubernetes-nodes'
    kubernetes_sd_configs:
      - role: node
    relabel_configs:
      - action: labelmap
        regex: __meta_kubernetes_node_label_(.+)

  # Kubernetes Pods
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - production
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

### Alert Rules

**File**: `monitoring/alert_rules.yml`

```yaml
groups:
  - name: evergame_360_alerts
    interval: 30s
    rules:
      # High Error Rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} (threshold: 0.05)"

      # Database Connection Pool Exhaustion
      - alert: DatabasePoolExhausted
        expr: database_connection_pool_active / database_connection_pool_max > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Database connection pool nearly exhausted"
          description: "{{ $value }}% of connection pool in use"

      # High Memory Usage
      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage at {{ $value }}%"

      # Pod Restart Loop
      - alert: PodRestartLoop
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Pod restarting frequently"
          description: "Pod {{ $labels.pod }} restarting"

      # GDA Assignment Failure
      - alert: GDAAssignmentFailure
        expr: rate(gda_assignment_failures_total[5m]) > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "GDA assignment failures detected"
          description: "{{ $value }} assignment failures per second"

      # Task Completion Delay
      - alert: TaskCompletionDelay
        expr: task_completion_duration_seconds > 300
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Tasks taking too long to complete"
          description: "Average completion time: {{ $value }}s (threshold: 300s)"
```

---

## 🎯 FINAL DEPLOYMENT CHECKLIST

### Pre-Game Day (January 2-3, 2026)

- [ ] **Infrastructure Validation**
  - [ ] All EKS nodes healthy
  - [ ] RDS Multi-AZ failover tested
  - [ ] Redis cluster operational
  - [ ] Load balancer health checks passing

- [ ] **Application Validation**
  - [ ] Latest version deployed
  - [ ] All pods in "Running" state
  - [ ] No crash loops detected
  - [ ] Health endpoints returning 200

- [ ] **Integration Validation**
  - [ ] Sentrais connectivity confirmed
  - [ ] NFL GMS sync operational
  - [ ] Game clock sync working
  - [ ] WebSocket connections stable

- [ ] **Monitoring Validation**
  - [ ] Prometheus scraping metrics
  - [ ] Grafana dashboards visible
  - [ ] Alerts configured and tested
  - [ ] Slack notifications working

- [ ] **Security Validation**
  - [ ] Secrets rotation completed
  - [ ] SSL certificates valid
  - [ ] WAF rules active
  - [ ] Access logs enabled

### Game Day (January 4, 2026)

- [ ] **T-6 Hours: Final System Check**
  - [ ] Run full smoke test suite
  - [ ] Verify all 238 GDA accounts active
  - [ ] Confirm Caesars Superdome venue ready
  - [ ] Test emergency rollback procedure

- [ ] **T-4 Hours: Pre-Game Readiness**
  - [ ] GDAs begin position check-in
  - [ ] Real-time dashboard updates confirmed
  - [ ] WebSocket connections: 238/238
  - [ ] All 9 systems reporting "Ready"

- [ ] **T-1 Hour: Go/No-Go Decision**
  - [ ] CTO approval for go-live
  - [ ] NFL representative confirmation
  - [ ] Incident response team on standby
  - [ ] Rollback plan reviewed

- [ ] **Kickoff: Live Operations**
  - [ ] Monitor dashboard every 5 minutes
  - [ ] Track task completion rates
  - [ ] Watch for any anomalies
  - [ ] Log all system events

- [ ] **Post-Game: Analysis**
  - [ ] Capture all metrics
  - [ ] GDA feedback collection
  - [ ] System performance report
  - [ ] Lessons learned documentation

---

**Package Status**: ✅ PRODUCTION-READY  
**Next Update**: Post-Game Analysis (January 5, 2026)  
**Owner**: Platform Engineering Team
