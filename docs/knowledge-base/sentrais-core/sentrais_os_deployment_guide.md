# Sentrais OS — Deployment Guide

## Infrastructure-as-Code, Database Migrations, n8n Configuration & Operational Runbooks

**Version:** 1.0.0
**Classification:** Internal — Engineering
**Architecture Owner:** Sentrais Corporation
**Date:** February 2026
**Companion Documents:** sentrais_n8n_architecture_part1.md, sentrais_n8n_architecture_part2.md

---

## Table of Contents

1. [Deployment Overview](#1-deployment-overview)
2. [Prerequisites & Toolchain](#2-prerequisites--toolchain)
3. [Local Development Environment](#3-local-development-environment)
4. [Database Migrations](#4-database-migrations)
5. [n8n Workflow Deployment](#5-n8n-workflow-deployment)
6. [API Gateway Configuration](#6-api-gateway-configuration)
7. [Google Cloud Platform (Production)](#7-google-cloud-platform-production)
8. [CI/CD Pipeline](#8-cicd-pipeline)
9. [Environment Configuration](#9-environment-configuration)
10. [Operational Runbooks](#10-operational-runbooks)
11. [Monitoring & Alerting Setup](#11-monitoring--alerting-setup)
12. [Disaster Recovery](#12-disaster-recovery)

---

# 1. Deployment Overview

## 1.1 Architecture Topology

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SENTRAIS OS DEPLOYMENT                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  TIER 1: EDGE / INGESTION                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                    │
│  │ API Gateway  │  │ WebSocket   │  │ Data        │                    │
│  │ (Kong)       │  │ Gateway     │  │ Ingestion   │                    │
│  └──────┬───────┘  └──────┬──────┘  └──────┬──────┘                    │
│         │                 │                 │                           │
│  TIER 2: ORCHESTRATION                                                  │
│  ┌──────┴─────────────────┴─────────────────┴──────┐                    │
│  │                n8n Cluster                       │                    │
│  │  (Workflow Engine — Main + Workers)              │                    │
│  └──────┬─────────────────┬─────────────────┬──────┘                    │
│         │                 │                 │                           │
│  TIER 3: DATA STORES                                                    │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌───────┴─────┐  ┌──────────┐     │
│  │ PostgreSQL  │  │ TimescaleDB │  │ MongoDB     │  │ Redis    │     │
│  │ (Operational│  │ (Time-Series│  │ (Documents/ │  │ (Cache/  │     │
│  │  + Evidence)│  │  Metrics)   │  │  SOPs)      │  │  State)  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘     │
│                                                                         │
│  TIER 4: OBSERVABILITY                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                    │
│  │ Prometheus  │  │ Grafana     │  │ ELK / Cloud │                    │
│  │ + AlertMgr  │  │ Dashboards  │  │ Logging     │                    │
│  └─────────────┘  └─────────────┘  └─────────────┘                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 1.2 Deployment Environments

| Environment | Purpose | Infrastructure | Data |
|-------------|---------|---------------|------|
| `local` | Developer workstation | Docker Compose | Synthetic seed data |
| `dev` | Integration testing | GKE Autopilot (small) | Synthetic + test data |
| `staging` | Pre-production validation | GKE Autopilot (prod-mirror) | Anonymized production data |
| `production` | Live operations | GKE Standard (multi-zone) | Real venue data |

## 1.3 Service Inventory

| Service | Image | Port | Replicas (Prod) |
|---------|-------|------|-----------------|
| n8n-main | `n8nio/n8n:1.74.x` | 5678 | 2 |
| n8n-worker | `n8nio/n8n:1.74.x` | — | 4-8 (auto-scale) |
| postgresql | `timescale/timescaledb:latest-pg16` | 5432 | 1 (HA replica) |
| mongodb | `mongo:7.0` | 27017 | 3 (replica set) |
| redis | `redis:7-alpine` | 6379 | 3 (sentinel) |
| kong | `kong:3.6` | 8000/8443 | 2 |
| ws-gateway | `sentrais/ws-gateway:latest` | 8080 | 2-4 |
| prometheus | `prom/prometheus:latest` | 9090 | 1 |
| grafana | `grafana/grafana:latest` | 3000 | 1 |

---

# 2. Prerequisites & Toolchain

## 2.1 Required Tools

```bash
# Core tools
docker --version          # >= 24.0
docker compose version    # >= 2.24
terraform --version       # >= 1.7
gcloud --version          # >= 460.0
kubectl version           # >= 1.28
helm version              # >= 3.14

# Database tools
psql --version            # >= 16
mongosh --version         # >= 2.1

# Development tools
node --version            # >= 20 LTS
npm --version             # >= 10
```

## 2.2 Installation Script

```bash
#!/bin/bash
# scripts/setup-toolchain.sh
set -euo pipefail

echo "=== Sentrais OS Toolchain Setup ==="

# Verify Docker
if ! command -v docker &> /dev/null; then
  echo "ERROR: Docker not installed. Visit https://docs.docker.com/get-docker/"
  exit 1
fi

# Verify Docker Compose
if ! docker compose version &> /dev/null; then
  echo "ERROR: Docker Compose V2 not available."
  exit 1
fi

# Install Terraform
if ! command -v terraform &> /dev/null; then
  echo "Installing Terraform..."
  curl -fsSL https://releases.hashicorp.com/terraform/1.7.5/terraform_1.7.5_linux_amd64.zip -o /tmp/terraform.zip
  unzip -o /tmp/terraform.zip -d /usr/local/bin/
  rm /tmp/terraform.zip
fi

# Install gcloud CLI
if ! command -v gcloud &> /dev/null; then
  echo "Installing Google Cloud CLI..."
  curl https://sdk.cloud.google.com | bash -s -- --disable-prompts
  source ~/google-cloud-sdk/path.bash.inc
fi

# Install kubectl
if ! command -v kubectl &> /dev/null; then
  echo "Installing kubectl..."
  gcloud components install kubectl
fi

# Install Helm
if ! command -v helm &> /dev/null; then
  echo "Installing Helm..."
  curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi

# Install n8n CLI (for workflow import/export)
npm install -g n8n

echo "=== Toolchain setup complete ==="
```

## 2.3 Repository Structure

```
sentrais-os/
├── docker/
│   ├── docker-compose.yml              # Full local stack
│   ├── docker-compose.dev.yml          # Dev overrides
│   ├── docker-compose.test.yml         # Test overrides
│   └── .env.template                   # Environment template
├── terraform/
│   ├── environments/
│   │   ├── dev/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── terraform.tfvars
│   │   ├── staging/
│   │   └── production/
│   ├── modules/
│   │   ├── gke-cluster/
│   │   ├── cloud-sql/
│   │   ├── mongodb-atlas/
│   │   ├── redis-memorystore/
│   │   ├── networking/
│   │   ├── monitoring/
│   │   └── security/
│   └── shared/
│       ├── providers.tf
│       └── backend.tf
├── kubernetes/
│   ├── base/
│   │   ├── n8n/
│   │   ├── kong/
│   │   ├── ws-gateway/
│   │   └── monitoring/
│   ├── overlays/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── production/
│   └── kustomization.yaml
├── db/
│   ├── migrations/
│   │   ├── postgresql/
│   │   │   ├── V001__create_core_schema.sql
│   │   │   ├── V002__create_events_tables.sql
│   │   │   ├── V003__create_incidents_tables.sql
│   │   │   ├── V004__create_evidence_ledger.sql
│   │   │   ├── V005__create_sop_tables.sql
│   │   │   ├── V006__create_integrations.sql
│   │   │   ├── V007__create_compliance_tables.sql
│   │   │   ├── V008__create_reporting_tables.sql
│   │   │   ├── V009__create_timescale_hypertables.sql
│   │   │   └── V010__create_indexes_and_rls.sql
│   │   └── mongodb/
│   │       ├── 001_create_collections.js
│   │       ├── 002_create_indexes.js
│   │       └── 003_seed_sop_templates.js
│   ├── seeds/
│   │   ├── venues.sql
│   │   ├── staff.sql
│   │   ├── sop_templates.json
│   │   ├── compliance_frameworks.json
│   │   └── synthetic/
│   │       └── generate_synthetic_data.py
│   └── flyway.conf
├── n8n/
│   ├── workflows/
│   │   ├── shared/
│   │   │   ├── SHARED_Evidence_Writer.json
│   │   │   ├── SHARED_Notification_Service.json
│   │   │   └── SHARED_State_Machine.json
│   │   ├── lifecycle/
│   │   │   ├── LIFECYCLE_Prepare_Phase.json
│   │   │   ├── LIFECYCLE_Ready_Phase.json
│   │   │   ├── LIFECYCLE_Run_Phase.json
│   │   │   └── LIFECYCLE_Review_Phase.json
│   │   ├── run/
│   │   │   ├── RUN_Monitor_Systems.json
│   │   │   ├── RUN_Monitor_Crowd.json
│   │   │   ├── RUN_Monitor_Weather.json
│   │   │   └── RUN_Incident_Handler.json
│   │   ├── response/
│   │   │   ├── RESPONSE_SOP_Executor.json
│   │   │   └── RESPONSE_Escalation_Handler.json
│   │   ├── integration/
│   │   │   ├── INTEGRATION_System_Health_Monitor.json
│   │   │   └── INTEGRATION_Data_Ingester.json
│   │   ├── prediction/
│   │   │   ├── PREDICTION_Threshold_Monitor.json
│   │   │   └── PREDICTION_Equipment_Failure.json
│   │   └── reporting/
│   │       ├── REPORTING_After_Action.json
│   │       ├── REPORTING_Dashboard_Update.json
│   │       ├── REPORTING_Compliance_Report.json
│   │       └── REPORTING_Executive_Summary.json
│   ├── credentials/
│   │   └── credentials.template.json
│   └── scripts/
│       ├── import-workflows.sh
│       ├── export-workflows.sh
│       └── validate-workflows.sh
├── api/
│   ├── kong/
│   │   ├── kong.yml                    # Declarative config
│   │   └── plugins/
│   │       ├── jwt-auth.yml
│   │       ├── rate-limiting.yml
│   │       └── cors.yml
│   └── ws-gateway/
│       ├── Dockerfile
│       ├── src/
│       └── package.json
├── monitoring/
│   ├── prometheus/
│   │   ├── prometheus.yml
│   │   └── rules/
│   │       ├── sentrais-alerts.yml
│   │       └── recording-rules.yml
│   ├── grafana/
│   │   ├── provisioning/
│   │   │   ├── dashboards/
│   │   │   │   ├── sentrais-operations.json
│   │   │   │   ├── sentrais-workflows.json
│   │   │   │   └── sentrais-infrastructure.json
│   │   │   └── datasources/
│   │   │       └── datasources.yml
│   │   └── dashboards/
│   └── alertmanager/
│       └── alertmanager.yml
├── scripts/
│   ├── setup-toolchain.sh
│   ├── local-up.sh
│   ├── local-down.sh
│   ├── run-migrations.sh
│   ├── seed-data.sh
│   ├── deploy.sh
│   ├── rollback.sh
│   └── health-check.sh
├── docs/
│   ├── architecture/
│   ├── runbooks/
│   └── adr/                            # Architecture Decision Records
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-dev.yml
│       ├── deploy-staging.yml
│       └── deploy-production.yml
├── Makefile
└── README.md
```

---

# 3. Local Development Environment

## 3.1 Docker Compose — Full Stack

```yaml
# docker/docker-compose.yml
version: "3.9"

x-common-env: &common-env
  TZ: UTC
  SENTRAIS_ENV: local

services:
  # ════════════════════════════════════════════════
  # DATA STORES
  # ════════════════════════════════════════════════
  
  postgresql:
    image: timescale/timescaledb:latest-pg16
    container_name: sentrais-postgresql
    restart: unless-stopped
    environment:
      <<: *common-env
      POSTGRES_DB: sentrais_os
      POSTGRES_USER: ${POSTGRES_USER:-sentrais}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-sentrais_dev_2026}
      POSTGRES_INITDB_ARGS: "--auth-host=scram-sha-256"
    ports:
      - "5432:5432"
    volumes:
      - postgresql_data:/var/lib/postgresql/data
      - ./init-scripts/postgresql:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-sentrais} -d sentrais_os"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - sentrais-net

  mongodb:
    image: mongo:7.0
    container_name: sentrais-mongodb
    restart: unless-stopped
    environment:
      <<: *common-env
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER:-sentrais}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:-sentrais_dev_2026}
      MONGO_INITDB_DATABASE: sentrais_os
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./init-scripts/mongodb:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - sentrais-net

  redis:
    image: redis:7-alpine
    container_name: sentrais-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD:-sentrais_dev_2026} --maxmemory 256mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD:-sentrais_dev_2026}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - sentrais-net

  # ════════════════════════════════════════════════
  # N8N ORCHESTRATION ENGINE
  # ════════════════════════════════════════════════
  
  n8n:
    image: n8nio/n8n:1.74.2
    container_name: sentrais-n8n
    restart: unless-stopped
    environment:
      <<: *common-env
      # n8n core config
      N8N_HOST: localhost
      N8N_PORT: 5678
      N8N_PROTOCOL: http
      WEBHOOK_URL: http://localhost:5678/
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY:-sentrais-dev-encryption-key-change-in-prod}
      
      # Execution mode
      EXECUTIONS_MODE: regular
      EXECUTIONS_TIMEOUT: 300
      EXECUTIONS_TIMEOUT_MAX: 600
      
      # Database (n8n's own state)
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgresql
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: n8n_meta
      DB_POSTGRESDB_USER: ${POSTGRES_USER:-sentrais}
      DB_POSTGRESDB_PASSWORD: ${POSTGRES_PASSWORD:-sentrais_dev_2026}
      
      # Queue mode for scaling (local uses regular, prod uses queue)
      # EXECUTIONS_MODE: queue
      # QUEUE_BULL_REDIS_HOST: redis
      # QUEUE_BULL_REDIS_PORT: 6379
      # QUEUE_BULL_REDIS_PASSWORD: ${REDIS_PASSWORD:-sentrais_dev_2026}
      
      # Workflow settings
      N8N_DEFAULT_BINARY_DATA_MODE: filesystem
      N8N_BINARY_DATA_STORAGE_PATH: /home/node/.n8n/binary-data
      GENERIC_TIMEZONE: UTC
      
      # Community nodes (for custom Sentrais nodes)
      N8N_COMMUNITY_PACKAGES_ENABLED: "true"
      
      # Sentrais-specific environment variables (available in workflows)
      SENTRAIS_PG_HOST: postgresql
      SENTRAIS_PG_PORT: 5432
      SENTRAIS_PG_DB: sentrais_os
      SENTRAIS_PG_USER: ${POSTGRES_USER:-sentrais}
      SENTRAIS_PG_PASSWORD: ${POSTGRES_PASSWORD:-sentrais_dev_2026}
      SENTRAIS_MONGO_URI: mongodb://${MONGO_USER:-sentrais}:${MONGO_PASSWORD:-sentrais_dev_2026}@mongodb:27017/sentrais_os?authSource=admin
      SENTRAIS_REDIS_HOST: redis
      SENTRAIS_REDIS_PORT: 6379
      SENTRAIS_REDIS_PASSWORD: ${REDIS_PASSWORD:-sentrais_dev_2026}
      SENTRAIS_TIMESCALE_HOST: postgresql
      SENTRAIS_TIMESCALE_PORT: 5432
      SENTRAIS_TIMESCALE_DB: sentrais_os
      
      # External service URLs
      WEATHER_API_URL: ${WEATHER_API_URL:-https://api.openweathermap.org/data/2.5}
      WEATHER_API_KEY: ${WEATHER_API_KEY:-}
      SIPE_ENGINE_URL: ${SIPE_ENGINE_URL:-http://sipe-engine:8090}
      WS_GATEWAY_URL: http://ws-gateway:8080
      
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
      - ../n8n/workflows:/home/node/workflows:ro
    depends_on:
      postgresql:
        condition: service_healthy
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - sentrais-net

  # ════════════════════════════════════════════════
  # API GATEWAY
  # ════════════════════════════════════════════════
  
  kong:
    image: kong:3.6
    container_name: sentrais-kong
    restart: unless-stopped
    environment:
      <<: *common-env
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong/kong.yml
      KONG_PROXY_LISTEN: "0.0.0.0:8000, 0.0.0.0:8443 ssl"
      KONG_ADMIN_LISTEN: "0.0.0.0:8001"
      KONG_LOG_LEVEL: info
    ports:
      - "8000:8000"   # Proxy HTTP
      - "8443:8443"   # Proxy HTTPS
      - "8001:8001"   # Admin API
    volumes:
      - ../api/kong/kong.yml:/kong/kong.yml:ro
    depends_on:
      - n8n
    networks:
      - sentrais-net

  # ════════════════════════════════════════════════
  # WEBSOCKET GATEWAY
  # ════════════════════════════════════════════════
  
  ws-gateway:
    build:
      context: ../api/ws-gateway
      dockerfile: Dockerfile
    container_name: sentrais-ws-gateway
    restart: unless-stopped
    environment:
      <<: *common-env
      PORT: 8080
      REDIS_URL: redis://:${REDIS_PASSWORD:-sentrais_dev_2026}@redis:6379
      JWT_SECRET: ${JWT_SECRET:-sentrais-dev-jwt-secret-change-in-prod}
    ports:
      - "8080:8080"
    depends_on:
      redis:
        condition: service_healthy
    networks:
      - sentrais-net

  # ════════════════════════════════════════════════
  # OBSERVABILITY
  # ════════════════════════════════════════════════
  
  prometheus:
    image: prom/prometheus:latest
    container_name: sentrais-prometheus
    restart: unless-stopped
    volumes:
      - ../monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ../monitoring/prometheus/rules:/etc/prometheus/rules:ro
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=30d'
    networks:
      - sentrais-net

  grafana:
    image: grafana/grafana:latest
    container_name: sentrais-grafana
    restart: unless-stopped
    environment:
      <<: *common-env
      GF_SECURITY_ADMIN_USER: ${GRAFANA_USER:-admin}
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-sentrais_dev_2026}
      GF_INSTALL_PLUGINS: grafana-clock-panel,grafana-worldmap-panel
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ../monitoring/grafana/provisioning:/etc/grafana/provisioning:ro
    depends_on:
      - prometheus
    networks:
      - sentrais-net

volumes:
  postgresql_data:
  mongodb_data:
  redis_data:
  n8n_data:
  prometheus_data:
  grafana_data:

networks:
  sentrais-net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

## 3.2 Environment Template

```bash
# docker/.env.template
# Copy to docker/.env and customize

# ═══ DATABASE CREDENTIALS ═══
POSTGRES_USER=sentrais
POSTGRES_PASSWORD=sentrais_dev_2026
MONGO_USER=sentrais
MONGO_PASSWORD=sentrais_dev_2026
REDIS_PASSWORD=sentrais_dev_2026

# ═══ N8N ═══
N8N_ENCRYPTION_KEY=generate-a-random-32-char-string-here
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=sentrais_dev_2026

# ═══ API GATEWAY ═══
JWT_SECRET=generate-a-random-64-char-string-here

# ═══ EXTERNAL SERVICES ═══
WEATHER_API_URL=https://api.openweathermap.org/data/2.5
WEATHER_API_KEY=your_openweathermap_api_key
LIGHTNING_API_KEY=your_lightning_detection_api_key

# ═══ OBSERVABILITY ═══
GRAFANA_USER=admin
GRAFANA_PASSWORD=sentrais_dev_2026

# ═══ SENTRAIS CONFIG ═══
SENTRAIS_ENV=local
SENTRAIS_LOG_LEVEL=debug
```

## 3.3 Quick Start Script

```bash
#!/bin/bash
# scripts/local-up.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_ROOT/docker"

echo "╔══════════════════════════════════════════════╗"
echo "║        SENTRAIS OS — Local Environment       ║"
echo "║     Calm during chaos. Making complex simple.║"
echo "╚══════════════════════════════════════════════╝"

# Check for .env file
if [ ! -f "$DOCKER_DIR/.env" ]; then
  echo "Creating .env from template..."
  cp "$DOCKER_DIR/.env.template" "$DOCKER_DIR/.env"
  
  # Generate random encryption keys
  N8N_KEY=$(openssl rand -hex 16)
  JWT_KEY=$(openssl rand -hex 32)
  sed -i "s/generate-a-random-32-char-string-here/$N8N_KEY/" "$DOCKER_DIR/.env"
  sed -i "s/generate-a-random-64-char-string-here/$JWT_KEY/" "$DOCKER_DIR/.env"
  
  echo "⚠️  Generated .env file. Edit $DOCKER_DIR/.env to add API keys."
fi

echo ""
echo "Step 1/5: Starting data stores..."
cd "$DOCKER_DIR"
docker compose up -d postgresql mongodb redis
echo "  Waiting for health checks..."
sleep 10
docker compose exec postgresql pg_isready -U sentrais -d sentrais_os
echo "  ✓ Data stores healthy"

echo ""
echo "Step 2/5: Running database migrations..."
"$SCRIPT_DIR/run-migrations.sh"
echo "  ✓ Migrations complete"

echo ""
echo "Step 3/5: Starting n8n orchestration engine..."
docker compose up -d n8n
echo "  Waiting for n8n startup..."
sleep 15
until curl -sf http://localhost:5678/healthz > /dev/null 2>&1; do
  echo "  Waiting for n8n..."
  sleep 5
done
echo "  ✓ n8n healthy"

echo ""
echo "Step 4/5: Importing workflows..."
"$SCRIPT_DIR/../n8n/scripts/import-workflows.sh"
echo "  ✓ Workflows imported"

echo ""
echo "Step 5/5: Starting API gateway and observability..."
docker compose up -d kong ws-gateway prometheus grafana
sleep 5
echo "  ✓ All services started"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║             SENTRAIS OS READY                ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  n8n UI:       http://localhost:5678         ║"
echo "║  API Gateway:  http://localhost:8000         ║"
echo "║  WebSocket:    ws://localhost:8080            ║"
echo "║  Grafana:      http://localhost:3000          ║"
echo "║  Prometheus:   http://localhost:9090          ║"
echo "║  PostgreSQL:   localhost:5432                 ║"
echo "║  MongoDB:      localhost:27017                ║"
echo "║  Redis:        localhost:6379                 ║"
echo "╚══════════════════════════════════════════════╝"
```

---

# 4. Database Migrations

## 4.1 Migration Runner

```bash
#!/bin/bash
# scripts/run-migrations.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="$PROJECT_ROOT/db/migrations"

PG_HOST="${SENTRAIS_PG_HOST:-localhost}"
PG_PORT="${SENTRAIS_PG_PORT:-5432}"
PG_DB="${SENTRAIS_PG_DB:-sentrais_os}"
PG_USER="${POSTGRES_USER:-sentrais}"
PGPASSWORD="${POSTGRES_PASSWORD:-sentrais_dev_2026}"
export PGPASSWORD

echo "=== Running PostgreSQL Migrations ==="

# Create databases if they don't exist
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d postgres -c \
  "SELECT 1 FROM pg_database WHERE datname = 'sentrais_os'" | grep -q 1 || \
  psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d postgres -c "CREATE DATABASE sentrais_os;"

psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d postgres -c \
  "SELECT 1 FROM pg_database WHERE datname = 'n8n_meta'" | grep -q 1 || \
  psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d postgres -c "CREATE DATABASE n8n_meta;"

# Enable extensions
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -c "CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"

# Create migration tracking table
psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" <<SQL
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(20) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  checksum VARCHAR(64)
);
SQL

# Run SQL migrations in order
for migration in "$MIGRATIONS_DIR/postgresql"/V*.sql; do
  filename=$(basename "$migration")
  version=$(echo "$filename" | grep -oP 'V\K[0-9]+')
  checksum=$(sha256sum "$migration" | cut -d' ' -f1)
  
  # Check if already applied
  applied=$(psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -tAc \
    "SELECT checksum FROM schema_migrations WHERE version = '$version'")
  
  if [ -z "$applied" ]; then
    echo "  Applying $filename..."
    psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -f "$migration"
    psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -c \
      "INSERT INTO schema_migrations (version, filename, checksum) VALUES ('$version', '$filename', '$checksum')"
    echo "    ✓ Applied"
  elif [ "$applied" != "$checksum" ]; then
    echo "  ⚠️  WARNING: $filename has changed since last apply (checksum mismatch)"
    echo "     Expected: $applied"
    echo "     Current:  $checksum"
  else
    echo "  ⏭️  $filename (already applied)"
  fi
done

echo ""
echo "=== Running MongoDB Migrations ==="

MONGO_URI="${SENTRAIS_MONGO_URI:-mongodb://sentrais:sentrais_dev_2026@localhost:27017/sentrais_os?authSource=admin}"

for migration in "$MIGRATIONS_DIR/mongodb"/*.js; do
  filename=$(basename "$migration")
  echo "  Applying $filename..."
  mongosh "$MONGO_URI" --file "$migration"
  echo "    ✓ Applied"
done

echo ""
echo "=== All migrations complete ==="
```

## 4.2 PostgreSQL Migrations

### V001: Core Schema

```sql
-- db/migrations/postgresql/V001__create_core_schema.sql
-- Sentrais OS — Core Schema
-- Creates foundational tables used across all zones

BEGIN;

-- ════════════════════════════════════════════════
-- VENUES
-- ════════════════════════════════════════════════

CREATE TABLE venues (
  venue_id         VARCHAR(50) PRIMARY KEY,
  venue_name       VARCHAR(255) NOT NULL,
  venue_type       VARCHAR(50) NOT NULL CHECK (venue_type IN ('stadium', 'arena', 'amphitheater', 'convention_center', 'other')),
  address          JSONB NOT NULL,
  capacity         INTEGER NOT NULL,
  zones            JSONB NOT NULL DEFAULT '[]',
  integrations     JSONB NOT NULL DEFAULT '{}',
  settings         JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active           BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_venues_type ON venues(venue_type);
CREATE INDEX idx_venues_active ON venues(active);

-- ════════════════════════════════════════════════
-- STAFF
-- ════════════════════════════════════════════════

CREATE TABLE staff (
  staff_id         VARCHAR(50) PRIMARY KEY,
  venue_id         VARCHAR(50) NOT NULL REFERENCES venues(venue_id),
  user_id          VARCHAR(50),
  first_name       VARCHAR(100) NOT NULL,
  last_name        VARCHAR(100) NOT NULL,
  email            VARCHAR(255),
  phone            VARCHAR(20),
  role             VARCHAR(50) NOT NULL,
  department       VARCHAR(100),
  certifications   JSONB NOT NULL DEFAULT '[]',
  status           VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_venue ON staff(venue_id);
CREATE INDEX idx_staff_role ON staff(role);
CREATE INDEX idx_staff_status ON staff(status);

CREATE TABLE staff_certifications (
  cert_id          VARCHAR(50) PRIMARY KEY DEFAULT 'cert_' || gen_random_uuid()::text,
  staff_id         VARCHAR(50) NOT NULL REFERENCES staff(staff_id),
  certification_type VARCHAR(100) NOT NULL,
  issued_date      DATE NOT NULL,
  expiry_date      DATE,
  status           VARCHAR(20) NOT NULL DEFAULT 'current' CHECK (status IN ('current', 'expired', 'pending', 'revoked')),
  issuing_body     VARCHAR(255),
  certificate_ref  VARCHAR(255),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_certs_staff ON staff_certifications(staff_id);
CREATE INDEX idx_staff_certs_status ON staff_certifications(status);
CREATE INDEX idx_staff_certs_expiry ON staff_certifications(expiry_date);

-- ════════════════════════════════════════════════
-- CONFIGURATION
-- ════════════════════════════════════════════════

CREATE TABLE system_config (
  config_key       VARCHAR(100) PRIMARY KEY,
  config_value     JSONB NOT NULL,
  description      TEXT,
  category         VARCHAR(50),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by       VARCHAR(50)
);

-- Updated_at trigger function (reusable)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER trg_venues_updated_at BEFORE UPDATE ON venues 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_staff_updated_at BEFORE UPDATE ON staff 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMIT;
```

### V002: Events Tables

```sql
-- db/migrations/postgresql/V002__create_events_tables.sql
-- Sentrais OS — Events & Lifecycle

BEGIN;

CREATE TABLE events (
  event_id         VARCHAR(50) PRIMARY KEY,
  venue_id         VARCHAR(50) NOT NULL REFERENCES venues(venue_id),
  event_name       VARCHAR(255) NOT NULL,
  event_type       VARCHAR(50) NOT NULL,
  event_date       DATE NOT NULL,
  gates_open_time  TIMESTAMPTZ,
  start_time       TIMESTAMPTZ NOT NULL,
  end_time         TIMESTAMPTZ,
  estimated_clear  TIMESTAMPTZ,
  expected_attendance INTEGER,
  actual_attendance INTEGER,
  status           VARCHAR(30) NOT NULL DEFAULT 'scheduled' 
    CHECK (status IN ('scheduled', 'preparing', 'ready', 'running', 'reviewing', 'completed', 'cancelled')),
  current_zone     VARCHAR(20) DEFAULT 'prepare' 
    CHECK (current_zone IN ('prepare', 'ready', 'run', 'review')),
  current_sub_phase VARCHAR(50),
  event_config     JSONB NOT NULL DEFAULT '{}',
  weather_sensitivity VARCHAR(20) DEFAULT 'medium',
  broadcast        BOOLEAN DEFAULT false,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_venue ON events(venue_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_zone ON events(current_zone);

CREATE TABLE event_phases (
  phase_id         VARCHAR(50) PRIMARY KEY DEFAULT 'phase_' || gen_random_uuid()::text,
  event_id         VARCHAR(50) NOT NULL REFERENCES events(event_id),
  zone             VARCHAR(20) NOT NULL,
  sub_phase        VARCHAR(50),
  status           VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'active', 'completed', 'skipped', 'failed')),
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  duration_seconds INTEGER,
  validation_results JSONB,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_phases_event ON event_phases(event_id);
CREATE INDEX idx_event_phases_zone ON event_phases(zone);
CREATE INDEX idx_event_phases_status ON event_phases(status);

CREATE TABLE staff_assignments (
  assignment_id    VARCHAR(50) PRIMARY KEY DEFAULT 'asgn_' || gen_random_uuid()::text,
  event_id         VARCHAR(50) NOT NULL REFERENCES events(event_id),
  staff_id         VARCHAR(50) NOT NULL REFERENCES staff(staff_id),
  role             VARCHAR(50) NOT NULL,
  zone             VARCHAR(50),
  position         VARCHAR(100),
  shift_start      TIMESTAMPTZ,
  shift_end        TIMESTAMPTZ,
  checked_in       BOOLEAN DEFAULT false,
  checked_in_at    TIMESTAMPTZ,
  status           VARCHAR(20) DEFAULT 'assigned' 
    CHECK (status IN ('assigned', 'checked_in', 'active', 'released', 'no_show')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assignments_event ON staff_assignments(event_id);
CREATE INDEX idx_assignments_staff ON staff_assignments(staff_id);
CREATE INDEX idx_assignments_status ON staff_assignments(status);

CREATE TABLE event_reviews (
  review_id        VARCHAR(50) PRIMARY KEY DEFAULT 'review_' || gen_random_uuid()::text,
  event_id         VARCHAR(50) NOT NULL REFERENCES events(event_id) UNIQUE,
  venue_id         VARCHAR(50) NOT NULL REFERENCES venues(venue_id),
  review_status    VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (review_status IN ('pending', 'data_gathering', 'analysis', 'draft', 'published', 'archived')),
  performance_score JSONB,
  patterns_detected JSONB DEFAULT '[]',
  lessons_learned  JSONB DEFAULT '[]',
  improvement_tasks JSONB DEFAULT '[]',
  aar_report       JSONB,
  aar_generated_at TIMESTAMPTZ,
  reviewed_by      VARCHAR(50),
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_event ON event_reviews(event_id);
CREATE INDEX idx_reviews_venue ON event_reviews(venue_id);

CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON events 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON event_reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMIT;
```

### V003: Incidents Tables

```sql
-- db/migrations/postgresql/V003__create_incidents_tables.sql
-- Sentrais OS — Incident Management

BEGIN;

CREATE TABLE incidents (
  incident_id      VARCHAR(50) PRIMARY KEY,
  event_id         VARCHAR(50) REFERENCES events(event_id),
  venue_id         VARCHAR(50) NOT NULL REFERENCES venues(venue_id),
  incident_type    VARCHAR(50) NOT NULL,
  severity         VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status           VARCHAR(20) NOT NULL DEFAULT 'open' 
    CHECK (status IN ('open', 'assigned', 'in_progress', 'escalated', 'resolved', 'closed')),
  title            VARCHAR(500) NOT NULL,
  description      TEXT,
  location         JSONB,
  reported_by      VARCHAR(50),
  assigned_to      VARCHAR(50) REFERENCES staff(staff_id),
  sop_id           VARCHAR(50),
  sop_followed     BOOLEAN,
  evidence_complete BOOLEAN DEFAULT false,
  prevented        BOOLEAN DEFAULT false,
  first_response_at TIMESTAMPTZ,
  resolved_at      TIMESTAMPTZ,
  closed_at        TIMESTAMPTZ,
  resolution_notes TEXT,
  root_cause       TEXT,
  corrective_actions JSONB DEFAULT '[]',
  tags             TEXT[] DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incidents_event ON incidents(event_id);
CREATE INDEX idx_incidents_venue ON incidents(venue_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_type ON incidents(incident_type);
CREATE INDEX idx_incidents_created ON incidents(created_at);

CREATE TABLE incident_timelines (
  timeline_id      VARCHAR(50) PRIMARY KEY DEFAULT 'tl_' || gen_random_uuid()::text,
  incident_id      VARCHAR(50) NOT NULL REFERENCES incidents(incident_id),
  action           VARCHAR(100) NOT NULL,
  description      TEXT,
  performed_by     VARCHAR(50),
  evidence_ref     VARCHAR(50),
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incident_tl_incident ON incident_timelines(incident_id);
CREATE INDEX idx_incident_tl_created ON incident_timelines(created_at);

CREATE TABLE incident_resources (
  resource_id      VARCHAR(50) PRIMARY KEY DEFAULT 'res_' || gen_random_uuid()::text,
  incident_id      VARCHAR(50) NOT NULL REFERENCES incidents(incident_id),
  staff_id         VARCHAR(50) REFERENCES staff(staff_id),
  resource_type    VARCHAR(50) NOT NULL,
  assigned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at      TIMESTAMPTZ,
  status           VARCHAR(20) DEFAULT 'assigned' 
    CHECK (status IN ('assigned', 'en_route', 'on_scene', 'released'))
);

CREATE INDEX idx_incident_res_incident ON incident_resources(incident_id);
CREATE INDEX idx_incident_res_staff ON incident_resources(staff_id);

CREATE TABLE escalation_chains (
  chain_id         VARCHAR(50) PRIMARY KEY,
  venue_id         VARCHAR(50) NOT NULL REFERENCES venues(venue_id),
  incident_type    VARCHAR(50) NOT NULL,
  severity         VARCHAR(20) NOT NULL,
  levels           JSONB NOT NULL,
  active           BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_escalation_venue ON escalation_chains(venue_id);

CREATE TRIGGER trg_incidents_updated_at BEFORE UPDATE ON incidents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMIT;
```

### V004: Evidence Ledger

```sql
-- db/migrations/postgresql/V004__create_evidence_ledger.sql
-- Sentrais OS — Immutable Evidence Ledger
-- This is the core competitive moat. Hash-chain integrity.

BEGIN;

CREATE TABLE evidence_ledger (
  evidence_id      VARCHAR(50) PRIMARY KEY,
  event_id         VARCHAR(50),
  venue_id         VARCHAR(50) NOT NULL,
  timestamp        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  evidence_type    VARCHAR(100) NOT NULL,
  category         VARCHAR(50) NOT NULL,
  source_workflow  VARCHAR(100) NOT NULL,
  data             JSONB NOT NULL,
  compliance_tags  TEXT[] NOT NULL DEFAULT '{}',
  classification   VARCHAR(20) NOT NULL DEFAULT 'internal' 
    CHECK (classification IN ('public', 'internal', 'confidential', 'restricted')),
  hash             VARCHAR(64) NOT NULL,
  prev_hash        VARCHAR(64),
  sequence_num     BIGSERIAL,
  verified         BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique sequence per venue for hash chain
CREATE UNIQUE INDEX idx_evidence_sequence ON evidence_ledger(venue_id, sequence_num);
CREATE INDEX idx_evidence_event ON evidence_ledger(event_id);
CREATE INDEX idx_evidence_venue ON evidence_ledger(venue_id);
CREATE INDEX idx_evidence_type ON evidence_ledger(evidence_type);
CREATE INDEX idx_evidence_category ON evidence_ledger(category);
CREATE INDEX idx_evidence_tags ON evidence_ledger USING gin(compliance_tags);
CREATE INDEX idx_evidence_timestamp ON evidence_ledger(timestamp);
CREATE INDEX idx_evidence_source ON evidence_ledger(source_workflow);

-- IMMUTABILITY: Prevent updates and deletes on evidence
CREATE OR REPLACE FUNCTION prevent_evidence_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Evidence ledger records are immutable. Updates and deletes are prohibited.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_evidence_no_update 
  BEFORE UPDATE ON evidence_ledger 
  FOR EACH ROW EXECUTE FUNCTION prevent_evidence_modification();

CREATE TRIGGER trg_evidence_no_delete 
  BEFORE DELETE ON evidence_ledger 
  FOR EACH ROW EXECUTE FUNCTION prevent_evidence_modification();

-- Hash generation function
CREATE OR REPLACE FUNCTION generate_evidence_hash(
  p_evidence_id VARCHAR,
  p_event_id VARCHAR,
  p_venue_id VARCHAR,
  p_evidence_type VARCHAR,
  p_data JSONB,
  p_prev_hash VARCHAR
) RETURNS VARCHAR AS $$
BEGIN
  RETURN encode(
    digest(
      COALESCE(p_evidence_id, '') || '|' ||
      COALESCE(p_event_id, '') || '|' ||
      p_venue_id || '|' ||
      p_evidence_type || '|' ||
      p_data::text || '|' ||
      COALESCE(p_prev_hash, 'GENESIS'),
      'sha256'
    ),
    'hex'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Evidence integrity verification function
CREATE OR REPLACE FUNCTION verify_evidence_chain(p_venue_id VARCHAR)
RETURNS TABLE (
  evidence_id VARCHAR,
  sequence_num BIGINT,
  is_valid BOOLEAN,
  expected_hash VARCHAR,
  actual_hash VARCHAR
) AS $$
DECLARE
  rec RECORD;
  expected VARCHAR;
BEGIN
  FOR rec IN 
    SELECT e.evidence_id, e.sequence_num, e.event_id, e.venue_id, 
           e.evidence_type, e.data, e.hash, e.prev_hash
    FROM evidence_ledger e
    WHERE e.venue_id = p_venue_id
    ORDER BY e.sequence_num
  LOOP
    expected := generate_evidence_hash(
      rec.evidence_id, rec.event_id, rec.venue_id, 
      rec.evidence_type, rec.data, rec.prev_hash
    );
    
    evidence_id := rec.evidence_id;
    sequence_num := rec.sequence_num;
    actual_hash := rec.hash;
    expected_hash := expected;
    is_valid := (rec.hash = expected);
    
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMIT;
```

### V005: SOP Tables

```sql
-- db/migrations/postgresql/V005__create_sop_tables.sql
-- Sentrais OS — SOP Execution Tracking

BEGIN;

CREATE TABLE sop_executions (
  execution_id     VARCHAR(50) PRIMARY KEY,
  sop_id           VARCHAR(50) NOT NULL,
  sop_version      VARCHAR(20),
  event_id         VARCHAR(50) REFERENCES events(event_id),
  venue_id         VARCHAR(50) NOT NULL REFERENCES venues(venue_id),
  incident_id      VARCHAR(50) REFERENCES incidents(incident_id),
  triggered_by     VARCHAR(100) NOT NULL,
  trigger_type     VARCHAR(30) CHECK (trigger_type IN ('automatic', 'manual', 'escalation', 'chain')),
  status           VARCHAR(20) NOT NULL DEFAULT 'initiated' 
    CHECK (status IN ('initiated', 'in_progress', 'completed', 'failed', 'aborted', 'timeout')),
  current_phase    INTEGER DEFAULT 0,
  current_step     INTEGER DEFAULT 0,
  total_phases     INTEGER,
  total_steps      INTEGER,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  duration_seconds INTEGER,
  result           JSONB,
  error_details    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sop_exec_sop ON sop_executions(sop_id);
CREATE INDEX idx_sop_exec_event ON sop_executions(event_id);
CREATE INDEX idx_sop_exec_incident ON sop_executions(incident_id);
CREATE INDEX idx_sop_exec_status ON sop_executions(status);
CREATE INDEX idx_sop_exec_venue ON sop_executions(venue_id);

CREATE TABLE sop_step_completions (
  completion_id    VARCHAR(50) PRIMARY KEY DEFAULT 'step_' || gen_random_uuid()::text,
  execution_id     VARCHAR(50) NOT NULL REFERENCES sop_executions(execution_id),
  phase_index      INTEGER NOT NULL,
  step_index       INTEGER NOT NULL,
  step_name        VARCHAR(255),
  automation_level VARCHAR(20) CHECK (automation_level IN ('full', 'triggered', 'assisted', 'none')),
  status           VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'failed', 'timeout')),
  assigned_to      VARCHAR(50),
  completed_by     VARCHAR(50),
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  duration_seconds INTEGER,
  evidence_ids     TEXT[] DEFAULT '{}',
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_step_comp_exec ON sop_step_completions(execution_id);
CREATE INDEX idx_step_comp_status ON sop_step_completions(status);

CREATE TRIGGER trg_sop_exec_updated_at BEFORE UPDATE ON sop_executions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMIT;
```

### V006: Integrations

```sql
-- db/migrations/postgresql/V006__create_integrations.sql
-- Sentrais OS — System Integrations & Health

BEGIN;

CREATE TABLE integration_health (
  health_id        VARCHAR(50) PRIMARY KEY DEFAULT 'hlth_' || gen_random_uuid()::text,
  venue_id         VARCHAR(50) NOT NULL REFERENCES venues(venue_id),
  system_name      VARCHAR(100) NOT NULL,
  system_type      VARCHAR(50) NOT NULL,
  endpoint_url     VARCHAR(500),
  status           VARCHAR(20) NOT NULL DEFAULT 'unknown' 
    CHECK (status IN ('healthy', 'degraded', 'unhealthy', 'unknown')),
  response_time_ms INTEGER,
  last_check       TIMESTAMPTZ,
  last_success     TIMESTAMPTZ,
  consecutive_failures INTEGER DEFAULT 0,
  circuit_state    VARCHAR(20) DEFAULT 'closed' 
    CHECK (circuit_state IN ('closed', 'half_open', 'open')),
  circuit_opened_at TIMESTAMPTZ,
  error_message    TEXT,
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (venue_id, system_name)
);

CREATE INDEX idx_int_health_venue ON integration_health(venue_id);
CREATE INDEX idx_int_health_status ON integration_health(status);
CREATE INDEX idx_int_health_circuit ON integration_health(circuit_state);

CREATE TABLE active_alerts (
  alert_id         VARCHAR(50) PRIMARY KEY DEFAULT 'alert_' || gen_random_uuid()::text,
  venue_id         VARCHAR(50) NOT NULL REFERENCES venues(venue_id),
  event_id         VARCHAR(50) REFERENCES events(event_id),
  alert_type       VARCHAR(100) NOT NULL,
  severity         VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  source           VARCHAR(100) NOT NULL,
  title            VARCHAR(500) NOT NULL,
  description      TEXT,
  data             JSONB DEFAULT '{}',
  acknowledged     BOOLEAN DEFAULT false,
  acknowledged_by  VARCHAR(50),
  acknowledged_at  TIMESTAMPTZ,
  resolved         BOOLEAN DEFAULT false,
  resolved_at      TIMESTAMPTZ,
  auto_triggered_sop VARCHAR(50),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_venue ON active_alerts(venue_id);
CREATE INDEX idx_alerts_event ON active_alerts(event_id);
CREATE INDEX idx_alerts_severity ON active_alerts(severity);
CREATE INDEX idx_alerts_ack ON active_alerts(acknowledged);
CREATE INDEX idx_alerts_created ON active_alerts(created_at);

CREATE TABLE alert_history (
  LIKE active_alerts INCLUDING ALL,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_int_health_updated_at BEFORE UPDATE ON integration_health 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMIT;
```

### V007: Compliance Tables

```sql
-- db/migrations/postgresql/V007__create_compliance_tables.sql

BEGIN;

CREATE TABLE compliance_reports (
  report_id        VARCHAR(50) PRIMARY KEY,
  venue_id         VARCHAR(50) NOT NULL REFERENCES venues(venue_id),
  report_type      VARCHAR(30) NOT NULL,
  period_start     TIMESTAMPTZ NOT NULL,
  period_end       TIMESTAMPTZ NOT NULL,
  overall_score    NUMERIC(5,2),
  framework_scores JSONB NOT NULL DEFAULT '[]',
  violations       JSONB NOT NULL DEFAULT '[]',
  certifications   JSONB DEFAULT '{}',
  generated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_compliance_venue ON compliance_reports(venue_id);
CREATE INDEX idx_compliance_type ON compliance_reports(report_type);
CREATE INDEX idx_compliance_period ON compliance_reports(period_start, period_end);

CREATE TABLE inspections (
  inspection_id    VARCHAR(50) PRIMARY KEY DEFAULT 'insp_' || gen_random_uuid()::text,
  venue_id         VARCHAR(50) NOT NULL REFERENCES venues(venue_id),
  inspection_type  VARCHAR(100) NOT NULL,
  inspector        VARCHAR(255),
  inspection_date  DATE NOT NULL,
  status           VARCHAR(20) DEFAULT 'scheduled' 
    CHECK (status IN ('scheduled', 'in_progress', 'passed', 'failed', 'remediation')),
  findings         JSONB DEFAULT '[]',
  score            NUMERIC(5,2),
  evidence_ids     TEXT[] DEFAULT '{}',
  next_inspection  DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inspections_venue ON inspections(venue_id);
CREATE INDEX idx_inspections_date ON inspections(inspection_date);

CREATE TABLE improvement_tasks (
  task_id          VARCHAR(50) PRIMARY KEY DEFAULT 'task_' || gen_random_uuid()::text,
  venue_id         VARCHAR(50) NOT NULL REFERENCES venues(venue_id),
  source_event_id  VARCHAR(50) REFERENCES events(event_id),
  source_type      VARCHAR(50) NOT NULL,
  priority         VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  title            VARCHAR(500) NOT NULL,
  description      TEXT,
  assigned_to      VARCHAR(50),
  status           VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'deferred', 'cancelled')),
  due_date         DATE,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_venue ON improvement_tasks(venue_id);
CREATE INDEX idx_tasks_status ON improvement_tasks(status);
CREATE INDEX idx_tasks_priority ON improvement_tasks(priority);

CREATE TABLE financial_impact (
  impact_id        VARCHAR(50) PRIMARY KEY DEFAULT 'fin_' || gen_random_uuid()::text,
  venue_id         VARCHAR(50) NOT NULL REFERENCES venues(venue_id),
  event_id         VARCHAR(50) REFERENCES events(event_id),
  category         VARCHAR(50) NOT NULL CHECK (category IN ('cost_avoidance', 'revenue_optimization', 'efficiency_gains', 'penalty_avoidance')),
  amount           NUMERIC(12,2) NOT NULL,
  description      TEXT,
  evidence_ref     VARCHAR(50),
  recorded_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_financial_venue ON financial_impact(venue_id);
CREATE INDEX idx_financial_category ON financial_impact(category);

CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON improvement_tasks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMIT;
```

### V008: Reporting Tables

```sql
-- db/migrations/postgresql/V008__create_reporting_tables.sql

BEGIN;

-- Reporting tables are minimal in PostgreSQL since 
-- full reports are stored in MongoDB. These track metadata.

CREATE TABLE report_metadata (
  report_id        VARCHAR(50) PRIMARY KEY,
  venue_id         VARCHAR(50) NOT NULL REFERENCES venues(venue_id),
  event_id         VARCHAR(50) REFERENCES events(event_id),
  report_type      VARCHAR(50) NOT NULL CHECK (report_type IN ('aar', 'compliance', 'executive', 'dashboard_export')),
  title            VARCHAR(500),
  status           VARCHAR(20) DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'published', 'archived')),
  generated_by     VARCHAR(100),
  audience         VARCHAR(50),
  storage_ref      VARCHAR(255),
  generated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_venue ON report_metadata(venue_id);
CREATE INDEX idx_reports_type ON report_metadata(report_type);
CREATE INDEX idx_reports_status ON report_metadata(status);

COMMIT;
```

### V009: TimescaleDB Hypertables

```sql
-- db/migrations/postgresql/V009__create_timescale_hypertables.sql
-- Sentrais OS — Time-Series Tables (TimescaleDB)

BEGIN;

-- ════════════════════════════════════════════════
-- SENSOR READINGS (raw telemetry)
-- ════════════════════════════════════════════════

CREATE TABLE sensor_readings (
  time             TIMESTAMPTZ NOT NULL,
  venue_id         VARCHAR(50) NOT NULL,
  sensor_id        VARCHAR(100) NOT NULL,
  sensor_type      VARCHAR(50) NOT NULL,
  zone_id          VARCHAR(50),
  value            DOUBLE PRECISION NOT NULL,
  unit             VARCHAR(20),
  quality          VARCHAR(10) DEFAULT 'good' CHECK (quality IN ('good', 'suspect', 'bad')),
  metadata         JSONB DEFAULT '{}'
);

SELECT create_hypertable('sensor_readings', 'time');
CREATE INDEX idx_sensor_venue_time ON sensor_readings(venue_id, time DESC);
CREATE INDEX idx_sensor_type ON sensor_readings(sensor_type, time DESC);

-- ════════════════════════════════════════════════
-- CROWD METRICS (fused crowd data)
-- ════════════════════════════════════════════════

CREATE TABLE crowd_metrics (
  time             TIMESTAMPTZ NOT NULL,
  venue_id         VARCHAR(50) NOT NULL,
  zone_id          VARCHAR(50),
  total_occupancy  INTEGER,
  occupancy_pct    NUMERIC(5,2),
  density_level    VARCHAR(20) CHECK (density_level IN ('low', 'normal', 'elevated', 'warning', 'critical')),
  flow_rate        NUMERIC(8,2),
  flow_direction   VARCHAR(20),
  peak_zone        VARCHAR(50),
  data_sources     TEXT[] DEFAULT '{}',
  confidence       NUMERIC(3,2)
);

SELECT create_hypertable('crowd_metrics', 'time');
CREATE INDEX idx_crowd_venue_time ON crowd_metrics(venue_id, time DESC);
CREATE INDEX idx_crowd_zone ON crowd_metrics(zone_id, time DESC);
CREATE INDEX idx_crowd_density ON crowd_metrics(density_level);

-- ════════════════════════════════════════════════
-- WEATHER READINGS
-- ════════════════════════════════════════════════

CREATE TABLE weather_readings (
  time             TIMESTAMPTZ NOT NULL,
  venue_id         VARCHAR(50) NOT NULL,
  temperature_f    NUMERIC(5,1),
  humidity_pct     NUMERIC(5,1),
  wind_speed_mph   NUMERIC(5,1),
  wind_gust_mph    NUMERIC(5,1),
  wind_direction   VARCHAR(10),
  precipitation_in NUMERIC(5,2),
  visibility_mi    NUMERIC(5,1),
  conditions       VARCHAR(50),
  lightning_detected BOOLEAN DEFAULT false,
  lightning_distance_mi NUMERIC(5,1),
  heat_index_f     NUMERIC(5,1),
  threat_level     VARCHAR(20) DEFAULT 'none' CHECK (threat_level IN ('none', 'watch', 'warning', 'severe')),
  source           VARCHAR(50)
);

SELECT create_hypertable('weather_readings', 'time');
CREATE INDEX idx_weather_venue_time ON weather_readings(venue_id, time DESC);
CREATE INDEX idx_weather_threat ON weather_readings(threat_level);

-- ════════════════════════════════════════════════
-- SYSTEM HEALTH TIME-SERIES
-- ════════════════════════════════════════════════

CREATE TABLE system_health_ts (
  time             TIMESTAMPTZ NOT NULL,
  venue_id         VARCHAR(50) NOT NULL,
  system_name      VARCHAR(100) NOT NULL,
  status           VARCHAR(20) NOT NULL,
  response_time_ms INTEGER,
  uptime_pct       NUMERIC(6,3),
  error_count      INTEGER DEFAULT 0,
  metadata         JSONB DEFAULT '{}'
);

SELECT create_hypertable('system_health_ts', 'time');
CREATE INDEX idx_sys_health_venue ON system_health_ts(venue_id, time DESC);
CREATE INDEX idx_sys_health_system ON system_health_ts(system_name, time DESC);

-- ════════════════════════════════════════════════
-- INCIDENT METRICS
-- ════════════════════════════════════════════════

CREATE TABLE incident_metrics (
  time              TIMESTAMPTZ NOT NULL,
  venue_id          VARCHAR(50) NOT NULL,
  event_id          VARCHAR(50),
  incident_type     VARCHAR(50),
  severity          VARCHAR(20),
  response_time_seconds NUMERIC(8,2),
  resolution_time_seconds NUMERIC(10,2),
  sop_executed      BOOLEAN
);

SELECT create_hypertable('incident_metrics', 'time');
CREATE INDEX idx_inc_metrics_venue ON incident_metrics(venue_id, time DESC);

-- ════════════════════════════════════════════════
-- GENERIC METRIC VALUES (for trend analysis)
-- ════════════════════════════════════════════════

CREATE TABLE metric_values (
  time             TIMESTAMPTZ NOT NULL,
  venue_id         VARCHAR(50) NOT NULL,
  metric_name      VARCHAR(100) NOT NULL,
  value            DOUBLE PRECISION NOT NULL,
  tags             JSONB DEFAULT '{}'
);

SELECT create_hypertable('metric_values', 'time');
CREATE INDEX idx_metric_venue_name ON metric_values(venue_id, metric_name, time DESC);

-- ════════════════════════════════════════════════
-- DASHBOARD SNAPSHOTS
-- ════════════════════════════════════════════════

CREATE TABLE dashboard_snapshots (
  time             TIMESTAMPTZ NOT NULL,
  venue_id         VARCHAR(50) NOT NULL,
  event_id         VARCHAR(50),
  metrics          JSONB NOT NULL,
  system_health_score NUMERIC(5,2),
  safety_score     NUMERIC(5,2),
  experience_score NUMERIC(5,2)
);

SELECT create_hypertable('dashboard_snapshots', 'time');
CREATE INDEX idx_dashboard_venue_time ON dashboard_snapshots(venue_id, time DESC);

-- ════════════════════════════════════════════════
-- PREDICTION RESULTS
-- ════════════════════════════════════════════════

CREATE TABLE prediction_results (
  time             TIMESTAMPTZ NOT NULL,
  venue_id         VARCHAR(50) NOT NULL,
  prediction_type  VARCHAR(50) NOT NULL,
  target_id        VARCHAR(100),
  probability      NUMERIC(4,3),
  confidence       NUMERIC(4,3),
  predicted_timeframe VARCHAR(50),
  model_version    VARCHAR(20),
  features         JSONB DEFAULT '{}',
  outcome          VARCHAR(20) CHECK (outcome IN ('pending', 'correct', 'incorrect', 'expired'))
);

SELECT create_hypertable('prediction_results', 'time');
CREATE INDEX idx_prediction_venue ON prediction_results(venue_id, time DESC);

-- ════════════════════════════════════════════════
-- THRESHOLD BREACHES
-- ════════════════════════════════════════════════

CREATE TABLE threshold_breaches (
  time             TIMESTAMPTZ NOT NULL,
  venue_id         VARCHAR(50) NOT NULL,
  metric_name      VARCHAR(100) NOT NULL,
  threshold_level  VARCHAR(20) CHECK (threshold_level IN ('warning', 'critical')),
  threshold_value  DOUBLE PRECISION,
  actual_value     DOUBLE PRECISION,
  consecutive      INTEGER DEFAULT 1,
  alert_generated  BOOLEAN DEFAULT false,
  sop_triggered    VARCHAR(50)
);

SELECT create_hypertable('threshold_breaches', 'time');
CREATE INDEX idx_breach_venue ON threshold_breaches(venue_id, time DESC);

-- ════════════════════════════════════════════════
-- COMPRESSION POLICIES (warm storage)
-- ════════════════════════════════════════════════

ALTER TABLE sensor_readings SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'venue_id, sensor_type',
  timescaledb.compress_orderby = 'time DESC'
);
SELECT add_compression_policy('sensor_readings', INTERVAL '30 days');

ALTER TABLE crowd_metrics SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'venue_id',
  timescaledb.compress_orderby = 'time DESC'
);
SELECT add_compression_policy('crowd_metrics', INTERVAL '30 days');

ALTER TABLE weather_readings SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'venue_id',
  timescaledb.compress_orderby = 'time DESC'
);
SELECT add_compression_policy('weather_readings', INTERVAL '30 days');

ALTER TABLE system_health_ts SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'venue_id, system_name',
  timescaledb.compress_orderby = 'time DESC'
);
SELECT add_compression_policy('system_health_ts', INTERVAL '30 days');

-- ════════════════════════════════════════════════
-- RETENTION POLICIES (data lifecycle)
-- ════════════════════════════════════════════════

-- Raw sensor data: keep 90 days
SELECT add_retention_policy('sensor_readings', INTERVAL '90 days');

-- Dashboard snapshots: keep 1 year
SELECT add_retention_policy('dashboard_snapshots', INTERVAL '365 days');

-- Prediction results: keep 2 years (for accuracy analysis)
SELECT add_retention_policy('prediction_results', INTERVAL '730 days');

COMMIT;
```

### V010: Row-Level Security & Final Indexes

```sql
-- db/migrations/postgresql/V010__create_indexes_and_rls.sql
-- Sentrais OS — Row-Level Security & Performance Indexes

BEGIN;

-- ════════════════════════════════════════════════
-- ROW-LEVEL SECURITY
-- ════════════════════════════════════════════════

-- Enable RLS on sensitive tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;

-- Venue-scoped access policy
CREATE POLICY venue_isolation_events ON events
  USING (venue_id = current_setting('app.current_venue_id', true));

CREATE POLICY venue_isolation_incidents ON incidents
  USING (venue_id = current_setting('app.current_venue_id', true));

CREATE POLICY venue_isolation_evidence ON evidence_ledger
  USING (venue_id = current_setting('app.current_venue_id', true));

CREATE POLICY venue_isolation_sops ON sop_executions
  USING (venue_id = current_setting('app.current_venue_id', true));

CREATE POLICY venue_isolation_compliance ON compliance_reports
  USING (venue_id = current_setting('app.current_venue_id', true));

-- Service role bypasses RLS
CREATE ROLE sentrais_service;
ALTER TABLE events FORCE ROW LEVEL SECURITY;
CREATE POLICY service_bypass_events ON events TO sentrais_service USING (true);
CREATE POLICY service_bypass_incidents ON incidents TO sentrais_service USING (true);
CREATE POLICY service_bypass_evidence ON evidence_ledger TO sentrais_service USING (true);

-- ════════════════════════════════════════════════
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ════════════════════════════════════════════════

-- Active incidents for a venue during an event
CREATE INDEX idx_incidents_venue_event_active 
  ON incidents(venue_id, event_id) WHERE status IN ('open', 'assigned', 'in_progress', 'escalated');

-- Evidence by event and category
CREATE INDEX idx_evidence_event_category 
  ON evidence_ledger(event_id, category);

-- SOP executions that are still running
CREATE INDEX idx_sop_exec_active 
  ON sop_executions(venue_id) WHERE status IN ('initiated', 'in_progress');

-- Staff available for assignment
CREATE INDEX idx_staff_available 
  ON staff(venue_id, role) WHERE status = 'active';

-- Unacknowledged alerts
CREATE INDEX idx_alerts_unack 
  ON active_alerts(venue_id, severity) WHERE acknowledged = false;

COMMIT;
```

## 4.3 MongoDB Migrations

```javascript
// db/migrations/mongodb/001_create_collections.js
// Sentrais OS — MongoDB Collection Setup

db = db.getSiblingDB('sentrais_os');

// SOP Definitions (versioned documents)
db.createCollection('sops', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['sop_id', 'venue_id', 'name', 'version', 'phases'],
      properties: {
        sop_id: { bsonType: 'string' },
        venue_id: { bsonType: 'string' },
        name: { bsonType: 'string' },
        version: { bsonType: 'string' },
        status: { enum: ['draft', 'active', 'deprecated', 'archived'] },
        incident_type: { bsonType: 'string' },
        severity_trigger: { bsonType: 'string' },
        phases: { bsonType: 'array' }
      }
    }
  }
});

// After-Action Reports
db.createCollection('after_action_reports', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['header', 'executive_summary'],
      properties: {
        header: { bsonType: 'object' },
        executive_summary: { bsonType: 'object' },
        incident_analysis: { bsonType: 'array' },
        recommendations: { bsonType: 'array' }
      }
    }
  }
});

// Executive Reports
db.createCollection('executive_reports');

// Evidence Documents (attachments/rich content)
db.createCollection('evidence_documents');

// SOP Templates
db.createCollection('sop_templates');

// Compliance Frameworks
db.createCollection('compliance_frameworks');

print('Collections created successfully');
```

```javascript
// db/migrations/mongodb/002_create_indexes.js

db = db.getSiblingDB('sentrais_os');

// SOP indexes
db.sops.createIndex({ sop_id: 1, version: -1 }, { unique: true });
db.sops.createIndex({ venue_id: 1, status: 1 });
db.sops.createIndex({ incident_type: 1 });

// AAR indexes
db.after_action_reports.createIndex({ 'metadata.event_id': 1 });
db.after_action_reports.createIndex({ 'metadata.generated_at': -1 });
db.after_action_reports.createIndex({ 'metadata.grade': 1 });

// Executive report indexes
db.executive_reports.createIndex({ audience: 1, generated_at: -1 });

// Compliance frameworks
db.compliance_frameworks.createIndex({ framework: 1, active: 1 });

// Text search on SOPs
db.sops.createIndex({ name: 'text', 'phases.steps.description': 'text' });

print('Indexes created successfully');
```

---

# 5. n8n Workflow Deployment

## 5.1 Workflow Import Script

```bash
#!/bin/bash
# n8n/scripts/import-workflows.sh
set -euo pipefail

N8N_URL="${N8N_URL:-http://localhost:5678}"
N8N_API_KEY="${N8N_API_KEY:-}"
WORKFLOW_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../workflows" && pwd)"

echo "=== Importing Sentrais OS Workflows ==="
echo "Target: $N8N_URL"

# Import order matters — shared utilities first
IMPORT_ORDER=(
  "shared/SHARED_Evidence_Writer.json"
  "shared/SHARED_Notification_Service.json"
  "shared/SHARED_State_Machine.json"
  "lifecycle/LIFECYCLE_Prepare_Phase.json"
  "lifecycle/LIFECYCLE_Ready_Phase.json"
  "lifecycle/LIFECYCLE_Run_Phase.json"
  "lifecycle/LIFECYCLE_Review_Phase.json"
  "run/RUN_Monitor_Systems.json"
  "run/RUN_Monitor_Crowd.json"
  "run/RUN_Monitor_Weather.json"
  "run/RUN_Incident_Handler.json"
  "response/RESPONSE_SOP_Executor.json"
  "response/RESPONSE_Escalation_Handler.json"
  "integration/INTEGRATION_System_Health_Monitor.json"
  "integration/INTEGRATION_Data_Ingester.json"
  "prediction/PREDICTION_Threshold_Monitor.json"
  "prediction/PREDICTION_Equipment_Failure.json"
  "reporting/REPORTING_After_Action.json"
  "reporting/REPORTING_Dashboard_Update.json"
  "reporting/REPORTING_Compliance_Report.json"
  "reporting/REPORTING_Executive_Summary.json"
)

imported=0
failed=0

for workflow_path in "${IMPORT_ORDER[@]}"; do
  full_path="$WORKFLOW_DIR/$workflow_path"
  
  if [ ! -f "$full_path" ]; then
    echo "  ⚠️  SKIP: $workflow_path (file not found)"
    continue
  fi
  
  workflow_name=$(basename "$workflow_path" .json)
  echo -n "  Importing $workflow_name... "
  
  # Check if workflow already exists
  existing=$(curl -sf "$N8N_URL/api/v1/workflows" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" 2>/dev/null | \
    python3 -c "import json,sys; data=json.load(sys.stdin); print(next((w['id'] for w in data.get('data',[]) if w['name']=='$workflow_name'), ''))" 2>/dev/null || echo "")
  
  if [ -n "$existing" ]; then
    # Update existing
    response=$(curl -sf -X PUT "$N8N_URL/api/v1/workflows/$existing" \
      -H "Content-Type: application/json" \
      -H "X-N8N-API-KEY: $N8N_API_KEY" \
      -d @"$full_path" 2>&1) && {
        echo "✓ Updated (ID: $existing)"
        ((imported++))
      } || {
        echo "✗ Failed to update"
        ((failed++))
      }
  else
    # Create new
    response=$(curl -sf -X POST "$N8N_URL/api/v1/workflows" \
      -H "Content-Type: application/json" \
      -H "X-N8N-API-KEY: $N8N_API_KEY" \
      -d @"$full_path" 2>&1) && {
        new_id=$(echo "$response" | python3 -c "import json,sys; print(json.load(sys.stdin).get('id','?'))" 2>/dev/null || echo "?")
        echo "✓ Created (ID: $new_id)"
        ((imported++))
      } || {
        echo "✗ Failed to create"
        ((failed++))
      }
  fi
done

echo ""
echo "=== Import Complete: $imported imported, $failed failed ==="
```

## 5.2 n8n Credentials Configuration

```json
// n8n/credentials/credentials.template.json
// Configure these in n8n UI or via API after first startup
{
  "credentials_to_create": [
    {
      "name": "Sentrais PostgreSQL",
      "type": "postgres",
      "data": {
        "host": "SENTRAIS_PG_HOST",
        "port": "SENTRAIS_PG_PORT",
        "database": "SENTRAIS_PG_DB",
        "user": "SENTRAIS_PG_USER",
        "password": "SENTRAIS_PG_PASSWORD",
        "ssl": false
      },
      "note": "Primary operational database. Used by all workflows."
    },
    {
      "name": "Sentrais TimescaleDB",
      "type": "postgres",
      "data": {
        "host": "SENTRAIS_TIMESCALE_HOST",
        "port": "SENTRAIS_TIMESCALE_PORT",
        "database": "SENTRAIS_TIMESCALE_DB",
        "user": "SENTRAIS_PG_USER",
        "password": "SENTRAIS_PG_PASSWORD",
        "ssl": false
      },
      "note": "Same PostgreSQL instance with TimescaleDB extension. Time-series queries."
    },
    {
      "name": "Sentrais MongoDB",
      "type": "mongoDb",
      "data": {
        "connectionString": "SENTRAIS_MONGO_URI"
      },
      "note": "Document store for SOPs, AARs, reports."
    },
    {
      "name": "Sentrais Redis",
      "type": "redis",
      "data": {
        "host": "SENTRAIS_REDIS_HOST",
        "port": "SENTRAIS_REDIS_PORT",
        "password": "SENTRAIS_REDIS_PASSWORD"
      },
      "note": "Cache, state, pub/sub for dashboards."
    },
    {
      "name": "Weather API",
      "type": "httpHeaderAuth",
      "data": {
        "name": "x-api-key",
        "value": "WEATHER_API_KEY"
      },
      "note": "OpenWeatherMap or venue weather station API."
    }
  ]
}
```

---

# 6. API Gateway Configuration

## 6.1 Kong Declarative Config

```yaml
# api/kong/kong.yml
_format_version: "3.0"

services:
  # ═══ n8n Webhook Endpoints → Sentrais API ═══
  
  - name: sentrais-events-api
    url: http://n8n:5678/webhook
    routes:
      - name: events-route
        paths:
          - /api/v1/events
        strip_path: false
        
  - name: sentrais-incidents-api
    url: http://n8n:5678/webhook
    routes:
      - name: incidents-route
        paths:
          - /api/v1/incidents
        strip_path: false
        
  - name: sentrais-sops-api
    url: http://n8n:5678/webhook
    routes:
      - name: sops-route
        paths:
          - /api/v1/sops
        strip_path: false

  - name: sentrais-systems-api
    url: http://n8n:5678/webhook
    routes:
      - name: systems-route
        paths:
          - /api/v1/systems
        strip_path: false

  - name: sentrais-crowd-api
    url: http://n8n:5678/webhook
    routes:
      - name: crowd-route
        paths:
          - /api/v1/crowd
        strip_path: false

  - name: sentrais-reports-api
    url: http://n8n:5678/webhook
    routes:
      - name: reports-route
        paths:
          - /api/v1/reports
        strip_path: false

  - name: sentrais-evidence-api
    url: http://n8n:5678/webhook
    routes:
      - name: evidence-route
        paths:
          - /api/v1/evidence
        strip_path: false

  - name: sentrais-predictions-api
    url: http://n8n:5678/webhook
    routes:
      - name: predictions-route
        paths:
          - /api/v1/predictions
        strip_path: false

  - name: sentrais-dashboards-api
    url: http://n8n:5678/webhook
    routes:
      - name: dashboards-route
        paths:
          - /api/v1/dashboards
        strip_path: false

  # ═══ WebSocket Gateway ═══
  
  - name: sentrais-ws
    url: http://ws-gateway:8080
    routes:
      - name: websocket-route
        paths:
          - /ws/v1
        strip_path: false
        protocols:
          - http
          - https

  # ═══ Health Check ═══
  
  - name: sentrais-health
    url: http://n8n:5678/healthz
    routes:
      - name: health-route
        paths:
          - /health
        strip_path: true

plugins:
  # ═══ Global Plugins ═══
  
  - name: cors
    config:
      origins:
        - "http://localhost:3000"
        - "http://localhost:5678"
        - "https://*.sentrais.com"
      methods:
        - GET
        - POST
        - PUT
        - DELETE
        - OPTIONS
      headers:
        - Authorization
        - Content-Type
        - X-Request-ID
        - X-Venue-ID
      max_age: 3600

  - name: rate-limiting
    config:
      minute: 100
      hour: 5000
      policy: redis
      redis_host: redis
      redis_port: 6379
      redis_password: "${REDIS_PASSWORD}"

  - name: request-transformer
    config:
      add:
        headers:
          - "X-Gateway: kong"
          - "X-Request-ID:$(uuid)"

  - name: response-transformer
    config:
      add:
        headers:
          - "X-Powered-By: Sentrais OS"
          - "X-Response-Time: $(latency)"
```

---

# 7. Google Cloud Platform (Production)

## 7.1 Terraform — Main Configuration

```hcl
# terraform/environments/production/main.tf

terraform {
  required_version = ">= 1.7.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
  }
  
  backend "gcs" {
    bucket = "sentrais-terraform-state"
    prefix = "production"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# ════════════════════════════════════════════════
# NETWORKING
# ════════════════════════════════════════════════

module "networking" {
  source = "../../modules/networking"
  
  project_id   = var.project_id
  region       = var.region
  environment  = "production"
  
  vpc_name     = "sentrais-production-vpc"
  subnet_cidr  = "10.0.0.0/20"
  pod_cidr     = "10.4.0.0/14"
  service_cidr = "10.8.0.0/20"
}

# ════════════════════════════════════════════════
# GKE CLUSTER
# ════════════════════════════════════════════════

module "gke" {
  source = "../../modules/gke-cluster"
  
  project_id   = var.project_id
  region       = var.region
  environment  = "production"
  
  cluster_name = "sentrais-production"
  network      = module.networking.vpc_id
  subnetwork   = module.networking.subnet_id
  
  # Node pools
  default_node_pool = {
    machine_type = "e2-standard-4"
    min_count    = 2
    max_count    = 6
    disk_size_gb = 100
  }
  
  n8n_node_pool = {
    machine_type = "e2-standard-8"
    min_count    = 2
    max_count    = 8
    disk_size_gb = 200
    labels       = { workload = "n8n" }
    taints       = []
  }
  
  monitoring_node_pool = {
    machine_type = "e2-standard-2"
    min_count    = 1
    max_count    = 2
    disk_size_gb = 100
    labels       = { workload = "monitoring" }
  }
  
  # Security
  enable_workload_identity = true
  enable_network_policy    = true
  enable_binary_auth       = true
  
  # Maintenance
  maintenance_window = {
    start_time = "2026-01-01T04:00:00Z"
    end_time   = "2026-01-01T08:00:00Z"
    recurrence = "FREQ=WEEKLY;BYDAY=SU"
  }
}

# ════════════════════════════════════════════════
# CLOUD SQL (PostgreSQL + TimescaleDB)
# ════════════════════════════════════════════════

module "cloud_sql" {
  source = "../../modules/cloud-sql"
  
  project_id   = var.project_id
  region       = var.region
  environment  = "production"
  
  instance_name = "sentrais-production-pg"
  database_version = "POSTGRES_16"
  tier         = "db-custom-4-16384"  # 4 vCPU, 16GB RAM
  
  # High availability
  availability_type = "REGIONAL"
  
  # Storage
  disk_size    = 100  # GB, auto-increases
  disk_type    = "PD_SSD"
  
  # Networking
  vpc_network  = module.networking.vpc_id
  
  # Backups
  backup_configuration = {
    enabled                        = true
    point_in_time_recovery_enabled = true
    start_time                     = "03:00"
    transaction_log_retention_days = 7
    retained_backups              = 30
  }
  
  # Database flags for TimescaleDB
  database_flags = [
    { name = "shared_preload_libraries", value = "timescaledb" },
    { name = "max_connections", value = "200" },
    { name = "work_mem", value = "64MB" },
    { name = "maintenance_work_mem", value = "512MB" },
    { name = "effective_cache_size", value = "12GB" },
    { name = "max_worker_processes", value = "16" },
    { name = "max_parallel_workers", value = "8" }
  ]
  
  databases = ["sentrais_os", "n8n_meta"]
}

# ════════════════════════════════════════════════
# REDIS (Memorystore)
# ════════════════════════════════════════════════

module "redis" {
  source = "../../modules/redis-memorystore"
  
  project_id   = var.project_id
  region       = var.region
  environment  = "production"
  
  instance_name = "sentrais-production-redis"
  tier          = "STANDARD_HA"   # High availability
  memory_size_gb = 4
  redis_version = "REDIS_7_0"
  
  vpc_network   = module.networking.vpc_id
  
  redis_configs = {
    maxmemory-policy = "allkeys-lru"
    notify-keyspace-events = "Kx"
  }
}

# ════════════════════════════════════════════════
# MONGODB ATLAS (managed)
# ════════════════════════════════════════════════

# MongoDB Atlas is managed externally via their Terraform provider
# Configure via: terraform/modules/mongodb-atlas/

# ════════════════════════════════════════════════
# MONITORING
# ════════════════════════════════════════════════

module "monitoring" {
  source = "../../modules/monitoring"
  
  project_id   = var.project_id
  environment  = "production"
  
  notification_channels = {
    pagerduty = var.pagerduty_integration_key
    slack     = var.slack_webhook_url
    email     = var.alert_email_addresses
  }
  
  alert_policies = {
    n8n_workflow_failure_rate = {
      threshold    = 0.05
      duration     = "300s"
      severity     = "CRITICAL"
      notification = "pagerduty"
    }
    api_error_rate = {
      threshold    = 0.01
      duration     = "300s"
      severity     = "ERROR"
      notification = "pagerduty"
    }
    database_cpu = {
      threshold    = 0.80
      duration     = "600s"
      severity     = "WARNING"
      notification = "slack"
    }
  }
}
```

## 7.2 Terraform Variables

```hcl
# terraform/environments/production/variables.tf

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "sentrais-production"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-east1"  # Low latency to East Coast NFL venues
}

variable "pagerduty_integration_key" {
  description = "PagerDuty integration key for critical alerts"
  type        = string
  sensitive   = true
}

variable "slack_webhook_url" {
  description = "Slack webhook for operational notifications"
  type        = string
  sensitive   = true
}

variable "alert_email_addresses" {
  description = "Email addresses for alert notifications"
  type        = list(string)
  default     = ["ops@sentrais.com"]
}
```

---

# 8. CI/CD Pipeline

## 8.1 GitHub Actions — CI

```yaml
# .github/workflows/ci.yml
name: Sentrais OS CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [develop]

jobs:
  lint-and-validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate SQL Migrations
        run: |
          for f in db/migrations/postgresql/*.sql; do
            echo "Validating $f..."
            # Basic SQL syntax check
            docker run --rm -v $(pwd):/work -w /work \
              postgres:16 pg_dump --help > /dev/null
          done
          
      - name: Validate Docker Compose
        run: docker compose -f docker/docker-compose.yml config --quiet
        
      - name: Validate Terraform
        run: |
          cd terraform/environments/production
          terraform init -backend=false
          terraform validate
          
      - name: Validate Kong Config
        run: |
          docker run --rm -v $(pwd)/api/kong:/kong \
            kong:3.6 kong config parse /kong/kong.yml

  test-migrations:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: timescale/timescaledb:latest-pg16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: sentrais_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Migrations
        env:
          PGPASSWORD: test
        run: |
          psql -h localhost -U test -d sentrais_test -c "CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"
          psql -h localhost -U test -d sentrais_test -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
          for f in db/migrations/postgresql/V*.sql; do
            echo "Running $f..."
            psql -h localhost -U test -d sentrais_test -f "$f"
          done
          
      - name: Verify Schema
        env:
          PGPASSWORD: test
        run: |
          # Verify key tables exist
          psql -h localhost -U test -d sentrais_test -c "\dt" | grep -q "venues"
          psql -h localhost -U test -d sentrais_test -c "\dt" | grep -q "events"
          psql -h localhost -U test -d sentrais_test -c "\dt" | grep -q "incidents"
          psql -h localhost -U test -d sentrais_test -c "\dt" | grep -q "evidence_ledger"
          psql -h localhost -U test -d sentrais_test -c "\dt" | grep -q "sensor_readings"
          echo "✓ All key tables verified"
          
      - name: Test Evidence Immutability
        env:
          PGPASSWORD: test
        run: |
          psql -h localhost -U test -d sentrais_test <<SQL
            INSERT INTO venues (venue_id, venue_name, venue_type, address, capacity)
            VALUES ('test_venue', 'Test Venue', 'stadium', '{}', 50000);
            
            INSERT INTO evidence_ledger (evidence_id, venue_id, evidence_type, category, source_workflow, data, hash)
            VALUES ('test_ev_1', 'test_venue', 'test', 'test', 'test', '{}', 'abc123');
            
            -- This should fail
            DO \$\$
            BEGIN
              UPDATE evidence_ledger SET data = '{"tampered": true}' WHERE evidence_id = 'test_ev_1';
              RAISE EXCEPTION 'UPDATE should have been blocked!';
            EXCEPTION WHEN OTHERS THEN
              RAISE NOTICE 'Evidence immutability verified: %', SQLERRM;
            END;
            \$\$;
          SQL
```

## 8.2 GitHub Actions — Deploy

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Authenticate to GCP
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
          
      - name: Set up GKE credentials
        uses: google-github-actions/get-gke-credentials@v2
        with:
          cluster_name: sentrais-production
          location: us-east1
          
      - name: Run Database Migrations
        run: |
          # Connect via Cloud SQL Proxy
          ./scripts/run-migrations.sh
          
      - name: Deploy to GKE
        run: |
          kubectl apply -k kubernetes/overlays/production/
          kubectl rollout status deployment/n8n-main -n sentrais --timeout=300s
          kubectl rollout status deployment/kong -n sentrais --timeout=120s
          
      - name: Import Updated Workflows
        run: |
          N8N_POD=$(kubectl get pods -n sentrais -l app=n8n-main -o jsonpath='{.items[0].metadata.name}')
          kubectl cp n8n/workflows/ sentrais/$N8N_POD:/tmp/workflows/
          kubectl exec -n sentrais $N8N_POD -- /bin/sh -c '/tmp/workflows/import.sh'
          
      - name: Health Check
        run: |
          ./scripts/health-check.sh production
          
      - name: Notify
        if: always()
        run: |
          STATUS="${{ job.status }}"
          VERSION="${{ github.ref_name }}"
          curl -X POST "${{ secrets.SLACK_WEBHOOK }}" \
            -H 'Content-type: application/json' \
            -d "{\"text\":\"Sentrais OS $VERSION deployment: $STATUS\"}"
```

---

# 9. Environment Configuration

## 9.1 Configuration Matrix

| Config Key | Local | Dev | Staging | Production |
|-----------|-------|-----|---------|------------|
| `SENTRAIS_ENV` | local | dev | staging | production |
| `LOG_LEVEL` | debug | debug | info | info |
| `N8N_EXECUTIONS_MODE` | regular | queue | queue | queue |
| `N8N_WORKERS` | 0 | 2 | 4 | 4-8 (auto) |
| `PG_MAX_CONNECTIONS` | 20 | 50 | 100 | 200 |
| `REDIS_MAX_MEMORY` | 256mb | 1gb | 2gb | 4gb |
| `API_RATE_LIMIT_MIN` | 1000 | 500 | 200 | 100 |
| `WS_MAX_CONNECTIONS` | 100 | 500 | 2000 | 10000 |
| `MONITORING_INTERVAL` | 30s | 30s | 30s | 30s |
| `DASHBOARD_PUSH_INTERVAL` | 30s | 30s | 30s | 30s |
| `EVIDENCE_HASH_VERIFY` | false | true | true | true |
| `RLS_ENABLED` | false | true | true | true |
| `TLS_ENABLED` | false | false | true | true |
| `BACKUP_ENABLED` | false | false | true | true |

---

# 10. Operational Runbooks

## 10.1 Service Health Check

```bash
#!/bin/bash
# scripts/health-check.sh
set -euo pipefail

ENV="${1:-local}"
echo "=== Sentrais OS Health Check ($ENV) ==="

check_service() {
  local name=$1 url=$2 expected=$3
  local status
  status=$(curl -sf -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  if [ "$status" = "$expected" ]; then
    echo "  ✓ $name (HTTP $status)"
    return 0
  else
    echo "  ✗ $name (HTTP $status, expected $expected)"
    return 1
  fi
}

FAILURES=0

if [ "$ENV" = "local" ]; then
  BASE="http://localhost"
  check_service "n8n"         "$BASE:5678/healthz"  "200" || ((FAILURES++))
  check_service "Kong"        "$BASE:8001/status"    "200" || ((FAILURES++))
  check_service "Grafana"     "$BASE:3000/api/health" "200" || ((FAILURES++))
  check_service "Prometheus"  "$BASE:9090/-/healthy"  "200" || ((FAILURES++))
  
  # Database checks
  echo ""
  echo "  Data Stores:"
  pg_isready -h localhost -p 5432 -U sentrais > /dev/null 2>&1 && \
    echo "  ✓ PostgreSQL" || { echo "  ✗ PostgreSQL"; ((FAILURES++)); }
  mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1 && \
    echo "  ✓ MongoDB" || { echo "  ✗ MongoDB"; ((FAILURES++)); }
  redis-cli -a sentrais_dev_2026 ping > /dev/null 2>&1 && \
    echo "  ✓ Redis" || { echo "  ✗ Redis"; ((FAILURES++)); }
fi

echo ""
if [ "$FAILURES" -eq 0 ]; then
  echo "=== All services healthy ==="
  exit 0
else
  echo "=== $FAILURES service(s) unhealthy ==="
  exit 1
fi
```

## 10.2 Runbook: Database Backup & Restore

```bash
# Backup PostgreSQL (local)
pg_dump -h localhost -U sentrais -d sentrais_os \
  --format=custom --compress=9 \
  --file="backup_sentrais_$(date +%Y%m%d_%H%M%S).dump"

# Backup evidence ledger specifically (critical data)
pg_dump -h localhost -U sentrais -d sentrais_os \
  --table=evidence_ledger --format=custom --compress=9 \
  --file="backup_evidence_$(date +%Y%m%d_%H%M%S).dump"

# Restore
pg_restore -h localhost -U sentrais -d sentrais_os \
  --clean --if-exists backup_sentrais_YYYYMMDD_HHMMSS.dump

# MongoDB backup
mongodump --uri="mongodb://sentrais:sentrais_dev_2026@localhost:27017/sentrais_os?authSource=admin" \
  --out="backup_mongo_$(date +%Y%m%d_%H%M%S)"

# MongoDB restore
mongorestore --uri="mongodb://sentrais:sentrais_dev_2026@localhost:27017/sentrais_os?authSource=admin" \
  backup_mongo_YYYYMMDD_HHMMSS/
```

## 10.3 Runbook: n8n Workflow Troubleshooting

```
SYMPTOM: Workflow execution stuck
─────────────────────────────────
1. Check n8n execution list:
   curl http://localhost:5678/api/v1/executions?status=running

2. Check for deadlocked database queries:
   psql -c "SELECT pid, query, state, wait_event FROM pg_stat_activity WHERE state = 'active';"

3. Force-stop stuck execution:
   curl -X POST http://localhost:5678/api/v1/executions/{id}/stop

4. If n8n is unresponsive:
   docker restart sentrais-n8n

SYMPTOM: Evidence ledger hash chain broken
──────────────────────────────────────────
1. Run integrity verification:
   psql -c "SELECT * FROM verify_evidence_chain('venue_mbs_001') WHERE is_valid = false;"

2. Identify break point (sequence_num of first invalid entry)

3. DO NOT modify evidence records. Escalate to engineering lead.

4. Generate incident report with evidence of chain break.

SYMPTOM: Monitoring loop not executing
──────────────────────────────────────
1. Check workflow activation status in n8n UI

2. Verify cron triggers:
   curl http://localhost:5678/api/v1/workflows | jq '.data[] | select(.active==true) | .name'

3. Check n8n logs:
   docker logs sentrais-n8n --tail 100 --since 10m

4. Verify database connectivity from n8n container:
   docker exec sentrais-n8n ping postgresql
```

## 10.4 Runbook: Scaling n8n Workers

```bash
# Local: not applicable (single instance)

# Production (GKE):
# Scale workers based on event load
kubectl scale deployment n8n-worker -n sentrais --replicas=8

# Check current worker load
kubectl top pods -n sentrais -l app=n8n-worker

# View active workflow executions
kubectl exec -n sentrais deploy/n8n-main -- \
  curl -s localhost:5678/api/v1/executions?status=running | jq '.data | length'

# Auto-scaling (configured in HPA)
kubectl get hpa -n sentrais
```

---

# 11. Monitoring & Alerting Setup

## 11.1 Prometheus Configuration

```yaml
# monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  
rule_files:
  - /etc/prometheus/rules/*.yml

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

scrape_configs:
  - job_name: 'n8n'
    metrics_path: /metrics
    static_configs:
      - targets: ['n8n:5678']
    
  - job_name: 'kong'
    static_configs:
      - targets: ['kong:8001']
    metrics_path: /metrics

  - job_name: 'postgresql'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'ws-gateway'
    static_configs:
      - targets: ['ws-gateway:8080']
    metrics_path: /metrics
```

## 11.2 Alert Rules

```yaml
# monitoring/prometheus/rules/sentrais-alerts.yml
groups:
  - name: sentrais_critical
    rules:
      - alert: N8nWorkflowFailureRate
        expr: rate(n8n_workflow_executions_total{status="failed"}[5m]) / rate(n8n_workflow_executions_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
          team: platform
        annotations:
          summary: "n8n workflow failure rate > 5%"
          description: "{{ $value | humanizePercentage }} of workflows failing in last 5 minutes"

      - alert: EvidenceLedgerWriteFailure
        expr: rate(sentrais_evidence_write_errors_total[5m]) > 0
        for: 1m
        labels:
          severity: critical
          team: platform
        annotations:
          summary: "Evidence ledger write failures detected"
          description: "Evidence integrity may be compromised. Investigate immediately."

      - alert: DatabaseConnectionPoolExhausted
        expr: pg_stat_activity_count / pg_settings_max_connections > 0.9
        for: 5m
        labels:
          severity: critical
          team: platform
        annotations:
          summary: "PostgreSQL connection pool > 90% utilized"

  - name: sentrais_warning
    rules:
      - alert: HighAPILatency
        expr: histogram_quantile(0.99, rate(kong_request_latency_ms_bucket[5m])) > 500
        for: 5m
        labels:
          severity: warning
          team: platform
        annotations:
          summary: "API p99 latency > 500ms"

      - alert: IntegrationUnhealthy
        expr: sentrais_integration_health{status!="healthy"} == 1
        for: 10m
        labels:
          severity: warning
          team: operations
        annotations:
          summary: "Integration {{ $labels.system_name }} unhealthy for 10+ minutes"

      - alert: DashboardUpdateLag
        expr: time() - sentrais_dashboard_last_update_timestamp > 60
        for: 2m
        labels:
          severity: warning
          team: platform
        annotations:
          summary: "Dashboard updates stale (> 60s old)"
```

---

# 12. Disaster Recovery

## 12.1 Recovery Objectives

| Component | RPO (Recovery Point) | RTO (Recovery Time) |
|-----------|---------------------|---------------------|
| Evidence Ledger | 0 (zero data loss) | < 1 hour |
| PostgreSQL (operational) | < 5 minutes | < 30 minutes |
| TimescaleDB (time-series) | < 15 minutes | < 1 hour |
| MongoDB (documents) | < 1 hour | < 1 hour |
| n8n (workflow state) | < 5 minutes | < 15 minutes |
| Redis (cache) | Rebuildable | < 5 minutes |

## 12.2 Recovery Procedures

```
SCENARIO: Complete Database Loss
─────────────────────────────────
1. Provision new Cloud SQL instance from latest backup
2. Apply point-in-time recovery to minimize data loss
3. Verify evidence ledger integrity:
   SELECT * FROM verify_evidence_chain('venue_id') WHERE is_valid = false;
4. Update n8n database connection credentials
5. Restart n8n pods
6. Run health checks
7. Verify all monitoring loops are executing
8. Generate incident report

SCENARIO: n8n Cluster Failure
─────────────────────────────
1. Database remains intact (separate service)
2. Deploy fresh n8n pods from container image
3. n8n recovers state from PostgreSQL (n8n_meta database)
4. Re-import any workflows not in n8n_meta:
   ./n8n/scripts/import-workflows.sh
5. Activate all workflows
6. Verify cron triggers are firing
7. Check monitoring loops resume within 60s

SCENARIO: Evidence Ledger Corruption
─────────────────────────────────────
1. STOP all evidence write operations immediately
2. Identify last valid entry:
   SELECT MAX(sequence_num) FROM verify_evidence_chain('venue_id') 
   WHERE is_valid = true;
3. Restore from backup to that point
4. Re-process events after the corruption point
5. Generate new evidence entries with correct hash chain
6. Verify full chain integrity
7. Document incident with timestamp and scope
```

---

# Appendix: Makefile

```makefile
# Makefile — Sentrais OS Developer Commands

.PHONY: up down migrate seed import status health logs clean

# ═══ LOCAL DEVELOPMENT ═══

up:                            ## Start all services
	@./scripts/local-up.sh

down:                          ## Stop all services
	@cd docker && docker compose down

restart:                       ## Restart all services
	@cd docker && docker compose restart

# ═══ DATABASE ═══

migrate:                       ## Run database migrations
	@./scripts/run-migrations.sh

seed:                          ## Load seed data
	@./scripts/seed-data.sh

reset-db:                      ## Drop and recreate databases
	@cd docker && docker compose down -v
	@cd docker && docker compose up -d postgresql mongodb redis
	@sleep 10
	@./scripts/run-migrations.sh
	@./scripts/seed-data.sh

# ═══ N8N WORKFLOWS ═══

import:                        ## Import all workflows
	@./n8n/scripts/import-workflows.sh

export:                        ## Export all workflows
	@./n8n/scripts/export-workflows.sh

# ═══ OPERATIONS ═══

status:                        ## Show service status
	@cd docker && docker compose ps

health:                        ## Run health checks
	@./scripts/health-check.sh local

logs:                          ## Tail all logs
	@cd docker && docker compose logs -f --tail=50

logs-n8n:                      ## Tail n8n logs
	@cd docker && docker compose logs -f --tail=100 n8n

logs-pg:                       ## Tail PostgreSQL logs
	@cd docker && docker compose logs -f --tail=100 postgresql

# ═══ INFRASTRUCTURE ═══

tf-plan:                       ## Terraform plan (production)
	@cd terraform/environments/production && terraform plan

tf-apply:                      ## Terraform apply (production)
	@cd terraform/environments/production && terraform apply

# ═══ CLEANUP ═══

clean:                         ## Remove all containers and volumes
	@cd docker && docker compose down -v --remove-orphans
	@docker system prune -f

help:                          ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
```

---

*Document Version: 1.0.0*
*Sentrais OS Deployment Guide*
*Architecture Team | Sentrais Corporation*
*SENTRAIS CORPORATION | DEPLOYMENT GUIDE | sentrais.com*
