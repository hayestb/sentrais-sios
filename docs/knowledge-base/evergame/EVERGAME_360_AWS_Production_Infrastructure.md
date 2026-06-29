# EVERGAME 360 - AWS Production Infrastructure
## Full Production Deployment for January 4, 2026 Live Game

**Target Game**: Saints vs Falcons - Caesars Superdome  
**Go-Live Date**: January 4, 2026  
**Days Remaining**: 44 days (as of Nov 21, 2025)  
**Status**: PRODUCTION-READY ARCHITECTURE

---

## 🎯 EXECUTIVE SUMMARY

This document outlines the complete AWS infrastructure for EVERGAME 360 production deployment, supporting:

- **238 Concurrent GDAs** across 32 NFL venues
- **Real-time orchestration** of 635-805 tasks across 9 technical systems
- **Sub-5-second latency** for dashboard updates
- **99.9% uptime SLA** with multi-region failover
- **Zero-downtime deployments** using blue-green strategy

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                       CLOUDFRONT CDN                            │
│               (Global Edge Caching - Low Latency)               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LOAD BALANCER                    │
│           (SSL Termination, Health Checks, Auto-Scaling)        │
└─────────────────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   EKS Cluster   │  │   EKS Cluster   │  │   EKS Cluster   │
│   us-east-1a    │  │   us-east-1b    │  │   us-east-1c    │
│  (Primary AZ)   │  │  (Standby AZ)   │  │  (Standby AZ)   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         ↓                    ↓                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                    RDS POSTGRESQL (Multi-AZ)                    │
│           Primary: us-east-1a | Standby: us-east-1b             │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                 ELASTICACHE REDIS (Cluster Mode)                │
│              Real-time Caching + WebSocket State                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ INFRASTRUCTURE COMPONENTS

### 1. Compute Layer: Amazon EKS (Kubernetes)

#### EKS Cluster Configuration

**File**: `infrastructure/terraform/eks-cluster.tf`

```hcl
# EVERGAME 360 EKS Cluster - Production Grade
# Region: us-east-1 (N. Virginia)
# Multi-AZ for High Availability

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC for EKS Cluster
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.2"

  name = "evergame-360-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = false  # Multi-NAT for HA
  enable_dns_hostnames = true
  enable_dns_support   = true

  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
  }

  tags = {
    Project     = "EVERGAME-360"
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}

# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.16.0"

  cluster_name    = "evergame-360-prod"
  cluster_version = "1.28"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Cluster endpoint configuration
  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  # Cluster addons
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }

  # Node groups
  eks_managed_node_groups = {
    # Core services node group
    core_services = {
      name = "evergame-360-core"

      instance_types = ["m6i.2xlarge"]  # 8 vCPU, 32GB RAM
      capacity_type  = "ON_DEMAND"      # Critical services need guaranteed capacity

      min_size     = 3
      max_size     = 10
      desired_size = 5

      labels = {
        workload = "core-services"
      }

      taints = []

      disk_size = 100  # GB

      update_config = {
        max_unavailable_percentage = 33  # Rolling updates
      }
    }

    # API services node group
    api_services = {
      name = "evergame-360-api"

      instance_types = ["c6i.2xlarge"]  # 8 vCPU, 16GB RAM (compute-optimized)
      capacity_type  = "ON_DEMAND"

      min_size     = 2
      max_size     = 8
      desired_size = 4

      labels = {
        workload = "api-services"
      }

      disk_size = 50
    }

    # WebSocket services node group
    websocket_services = {
      name = "evergame-360-websocket"

      instance_types = ["r6i.xlarge"]  # 4 vCPU, 32GB RAM (memory-optimized)
      capacity_type  = "ON_DEMAND"

      min_size     = 2
      max_size     = 6
      desired_size = 3

      labels = {
        workload = "websocket-services"
      }

      disk_size = 50
    }

    # Background jobs node group (can use spot)
    background_jobs = {
      name = "evergame-360-jobs"

      instance_types = ["m6i.xlarge"]
      capacity_type  = "SPOT"  # Cost optimization for non-critical jobs

      min_size     = 1
      max_size     = 5
      desired_size = 2

      labels = {
        workload = "background-jobs"
      }

      taints = [
        {
          key    = "workload"
          value  = "background-jobs"
          effect = "NoSchedule"
        }
      ]

      disk_size = 50
    }
  }

  # Cluster security group rules
  cluster_security_group_additional_rules = {
    ingress_nodes_ephemeral_ports_tcp = {
      description                = "Nodes on ephemeral ports"
      protocol                   = "tcp"
      from_port                  = 1025
      to_port                    = 65535
      type                       = "ingress"
      source_node_security_group = true
    }
  }

  # Node security group rules
  node_security_group_additional_rules = {
    ingress_self_all = {
      description = "Node to node all ports/protocols"
      protocol    = "-1"
      from_port   = 0
      to_port     = 0
      type        = "ingress"
      self        = true
    }
    egress_all = {
      description      = "Node all egress"
      protocol         = "-1"
      from_port        = 0
      to_port          = 0
      type             = "egress"
      cidr_blocks      = ["0.0.0.0/0"]
      ipv6_cidr_blocks = ["::/0"]
    }
  }

  tags = {
    Project     = "EVERGAME-360"
    Environment = "Production"
  }
}

# Cluster autoscaler IAM role
module "cluster_autoscaler_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "5.30.0"

  role_name = "cluster-autoscaler"

  attach_cluster_autoscaler_policy = true
  cluster_autoscaler_cluster_names = [module.eks.cluster_name]

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:cluster-autoscaler"]
    }
  }
}

# AWS Load Balancer Controller IAM role
module "load_balancer_controller_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "5.30.0"

  role_name = "load-balancer-controller"

  attach_load_balancer_controller_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:aws-load-balancer-controller"]
    }
  }
}

# Outputs
output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_name" {
  description = "Kubernetes Cluster Name"
  value       = module.eks.cluster_name
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}
```

---

### 2. Database Layer: Amazon RDS PostgreSQL

**File**: `infrastructure/terraform/rds.tf`

```hcl
# RDS PostgreSQL - Multi-AZ Production Database
# Supports 238 concurrent GDAs + 32 venues

resource "aws_db_subnet_group" "evergame_360" {
  name       = "evergame-360-db-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name        = "EVERGAME 360 DB Subnet Group"
    Project     = "EVERGAME-360"
    Environment = "Production"
  }
}

resource "aws_security_group" "rds" {
  name        = "evergame-360-rds-sg"
  description = "Security group for EVERGAME 360 RDS"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "PostgreSQL from EKS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "EVERGAME 360 RDS Security Group"
    Project     = "EVERGAME-360"
    Environment = "Production"
  }
}

resource "aws_db_parameter_group" "evergame_360" {
  name   = "evergame-360-postgres14"
  family = "postgres14"

  # Performance optimization parameters
  parameter {
    name  = "shared_buffers"
    value = "16384"  # 16GB (25% of 64GB RAM)
  }

  parameter {
    name  = "max_connections"
    value = "500"
  }

  parameter {
    name  = "work_mem"
    value = "32768"  # 32MB per operation
  }

  parameter {
    name  = "maintenance_work_mem"
    value = "2097152"  # 2GB
  }

  parameter {
    name  = "effective_cache_size"
    value = "49152"  # 48GB (75% of 64GB RAM)
  }

  parameter {
    name  = "checkpoint_completion_target"
    value = "0.9"
  }

  parameter {
    name  = "wal_buffers"
    value = "512"  # 512 * 8KB = 4MB
  }

  parameter {
    name  = "default_statistics_target"
    value = "100"
  }

  parameter {
    name  = "random_page_cost"
    value = "1.1"  # SSD-optimized
  }

  parameter {
    name  = "effective_io_concurrency"
    value = "200"  # SSD-optimized
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"  # Log queries > 1 second
  }

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  tags = {
    Name        = "EVERGAME 360 DB Parameter Group"
    Project     = "EVERGAME-360"
    Environment = "Production"
  }
}

resource "aws_db_instance" "evergame_360" {
  identifier = "evergame-360-prod"

  # Engine
  engine         = "postgres"
  engine_version = "14.9"

  # Instance class - db.r6i.2xlarge (8 vCPU, 64GB RAM)
  instance_class = "db.r6i.2xlarge"

  # Storage
  allocated_storage     = 500   # GB
  max_allocated_storage = 2000  # Auto-scaling up to 2TB
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id            = aws_kms_key.rds.arn

  # High Availability
  multi_az               = true
  availability_zone      = "us-east-1a"  # Primary AZ
  db_subnet_group_name   = aws_db_subnet_group.evergame_360.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Database configuration
  db_name  = "evergame360_prod"
  username = "evergame_admin"
  password = random_password.db_password.result
  port     = 5432

  # Parameter group
  parameter_group_name = aws_db_parameter_group.evergame_360.name

  # Backup configuration
  backup_retention_period   = 35  # 35 days (compliance requirement)
  backup_window             = "03:00-04:00"  # 3-4 AM UTC
  maintenance_window        = "mon:04:00-mon:05:00"
  copy_tags_to_snapshot     = true
  delete_automated_backups  = false
  deletion_protection       = true

  # Monitoring
  enabled_cloudwatch_logs_exports = [
    "postgresql",
    "upgrade"
  ]
  monitoring_interval = 60  # Enhanced monitoring every 60 seconds
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn

  # Performance Insights
  performance_insights_enabled    = true
  performance_insights_kms_key_id = aws_kms_key.rds.arn
  performance_insights_retention_period = 7  # days

  # Auto minor version upgrade
  auto_minor_version_upgrade = false  # Manual control for production

  # Apply changes immediately (use with caution)
  apply_immediately = false

  # Final snapshot
  skip_final_snapshot       = false
  final_snapshot_identifier = "evergame-360-prod-final-snapshot-${formatdate("YYYYMMDDhhmmss", timestamp())}"

  tags = {
    Name        = "EVERGAME 360 Production Database"
    Project     = "EVERGAME-360"
    Environment = "Production"
  }
}

# KMS key for RDS encryption
resource "aws_kms_key" "rds" {
  description             = "EVERGAME 360 RDS Encryption Key"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name        = "EVERGAME 360 RDS KMS Key"
    Project     = "EVERGAME-360"
    Environment = "Production"
  }
}

resource "aws_kms_alias" "rds" {
  name          = "alias/evergame-360-rds"
  target_key_id = aws_kms_key.rds.key_id
}

# Random password for database
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Store password in Secrets Manager
resource "aws_secretsmanager_secret" "db_password" {
  name = "evergame-360/rds/master-password"

  tags = {
    Name        = "EVERGAME 360 RDS Master Password"
    Project     = "EVERGAME-360"
    Environment = "Production"
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id = aws_secretsmanager_secret.db_password.id
  secret_string = jsonencode({
    username = aws_db_instance.evergame_360.username
    password = random_password.db_password.result
    engine   = "postgres"
    host     = aws_db_instance.evergame_360.address
    port     = aws_db_instance.evergame_360.port
    dbname   = aws_db_instance.evergame_360.db_name
  })
}

# IAM role for RDS monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "evergame-360-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# Read replica for reporting/analytics (optional)
resource "aws_db_instance" "evergame_360_replica" {
  identifier             = "evergame-360-prod-replica"
  replicate_source_db    = aws_db_instance.evergame_360.identifier
  instance_class         = "db.r6i.xlarge"  # Smaller for read-only
  publicly_accessible    = false
  skip_final_snapshot    = true
  auto_minor_version_upgrade = false

  tags = {
    Name        = "EVERGAME 360 Read Replica"
    Project     = "EVERGAME-360"
    Environment = "Production"
  }
}

# Outputs
output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.evergame_360.endpoint
  sensitive   = true
}

output "rds_read_replica_endpoint" {
  description = "RDS read replica endpoint"
  value       = aws_db_instance.evergame_360_replica.endpoint
  sensitive   = true
}

output "db_secret_arn" {
  description = "ARN of database credentials secret"
  value       = aws_secretsmanager_secret.db_password.arn
}
```

---

### 3. Caching Layer: Amazon ElastiCache Redis

**File**: `infrastructure/terraform/elasticache.tf`

```hcl
# ElastiCache Redis - Real-time Caching + WebSocket State
# Cluster mode enabled for horizontal scaling

resource "aws_elasticache_subnet_group" "evergame_360" {
  name       = "evergame-360-redis-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name        = "EVERGAME 360 Redis Subnet Group"
    Project     = "EVERGAME-360"
    Environment = "Production"
  }
}

resource "aws_security_group" "redis" {
  name        = "evergame-360-redis-sg"
  description = "Security group for EVERGAME 360 Redis"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "Redis from EKS"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "EVERGAME 360 Redis Security Group"
    Project     = "EVERGAME-360"
    Environment = "Production"
  }
}

resource "aws_elasticache_parameter_group" "evergame_360" {
  name   = "evergame-360-redis7-cluster"
  family = "redis7"

  # Performance optimizations
  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"  # Evict least recently used keys
  }

  parameter {
    name  = "timeout"
    value = "300"  # 5 minutes
  }

  parameter {
    name  = "tcp-keepalive"
    value = "300"
  }

  tags = {
    Name        = "EVERGAME 360 Redis Parameter Group"
    Project     = "EVERGAME-360"
    Environment = "Production"
  }
}

resource "aws_elasticache_replication_group" "evergame_360" {
  replication_group_id = "evergame-360-redis"
  description          = "EVERGAME 360 Redis Cluster for real-time caching"

  # Engine
  engine         = "redis"
  engine_version = "7.0"

  # Node configuration
  node_type = "cache.r6g.xlarge"  # 4 vCPU, 26.32 GB RAM

  # Cluster mode enabled for horizontal scaling
  num_node_groups         = 3  # 3 shards
  replicas_per_node_group = 2  # 2 replicas per shard = 9 total nodes

  # Network
  subnet_group_name  = aws_elasticache_subnet_group.evergame_360.name
  security_group_ids = [aws_security_group.redis.id]

  # Parameter group
  parameter_group_name = aws_elasticache_parameter_group.evergame_360.name

  # High Availability
  automatic_failover_enabled = true
  multi_az_enabled           = true

  # Encryption
  at_rest_encryption_enabled = true
  kms_key_id                 = aws_kms_key.redis.arn
  transit_encryption_enabled = true
  auth_token                 = random_password.redis_auth_token.result

  # Maintenance
  maintenance_window       = "mon:05:00-mon:06:00"
  snapshot_window          = "03:00-04:00"
  snapshot_retention_limit = 7
  auto_minor_version_upgrade = false

  # Logging
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_slow_log.name
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "slow-log"
  }

  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_engine_log.name
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "engine-log"
  }

  tags = {
    Name        = "EVERGAME 360 Redis Cluster"
    Project     = "EVERGAME-360"
    Environment = "Production"
  }
}

# KMS key for Redis encryption
resource "aws_kms_key" "redis" {
  description             = "EVERGAME 360 Redis Encryption Key"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name        = "EVERGAME 360 Redis KMS Key"
    Project     = "EVERGAME-360"
    Environment = "Production"
  }
}

resource "aws_kms_alias" "redis" {
  name          = "alias/evergame-360-redis"
  target_key_id = aws_kms_key.redis.key_id
}

# Random auth token for Redis
resource "random_password" "redis_auth_token" {
  length  = 32
  special = false  # Redis AUTH token requirements
}

# Store auth token in Secrets Manager
resource "aws_secretsmanager_secret" "redis_auth_token" {
  name = "evergame-360/redis/auth-token"

  tags = {
    Name        = "EVERGAME 360 Redis Auth Token"
    Project     = "EVERGAME-360"
    Environment = "Production"
  }
}

resource "aws_secretsmanager_secret_version" "redis_auth_token" {
  secret_id = aws_secretsmanager_secret.redis_auth_token.id
  secret_string = jsonencode({
    auth_token = random_password.redis_auth_token.result
    endpoint   = aws_elasticache_replication_group.evergame_360.configuration_endpoint_address
    port       = 6379
  })
}

# CloudWatch log groups
resource "aws_cloudwatch_log_group" "redis_slow_log" {
  name              = "/aws/elasticache/evergame-360/slow-log"
  retention_in_days = 30

  tags = {
    Name        = "EVERGAME 360 Redis Slow Log"
    Project     = "EVERGAME-360"
    Environment = "Production"
  }
}

resource "aws_cloudwatch_log_group" "redis_engine_log" {
  name              = "/aws/elasticache/evergame-360/engine-log"
  retention_in_days = 30

  tags = {
    Name        = "EVERGAME 360 Redis Engine Log"
    Project     = "EVERGAME-360"
    Environment = "Production"
  }
}

# Outputs
output "redis_endpoint" {
  description = "Redis cluster configuration endpoint"
  value       = aws_elasticache_replication_group.evergame_360.configuration_endpoint_address
  sensitive   = true
}

output "redis_secret_arn" {
  description = "ARN of Redis auth token secret"
  value       = aws_secretsmanager_secret.redis_auth_token.arn
}
```

---

## 📦 KUBERNETES DEPLOYMENTS

### Core Application Deployment

**File**: `kubernetes/deployments/evergame-360-core.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: evergame-360-core
  namespace: production
  labels:
    app: evergame-360
    component: core
    version: v5.1
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0  # Zero-downtime deployments
  selector:
    matchLabels:
      app: evergame-360
      component: core
  template:
    metadata:
      labels:
        app: evergame-360
        component: core
        version: v5.1
    spec:
      serviceAccountName: evergame-360-core
      
      # Node affinity - run on core-services nodes
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: workload
                operator: In
                values:
                - core-services
        
        # Pod anti-affinity - spread across nodes
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - evergame-360
              topologyKey: kubernetes.io/hostname
      
      containers:
      - name: evergame-360-core
        image: ghcr.io/nfl/evergame-360:v5.1
        imagePullPolicy: IfNotPresent
        
        ports:
        - name: http
          containerPort: 8000
          protocol: TCP
        - name: metrics
          containerPort: 9090
          protocol: TCP
        
        env:
        # Database connection (from Secrets Manager)
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: connection_string
        
        # Redis connection (from Secrets Manager)
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: connection_string
        
        # Application configuration
        - name: ENVIRONMENT
          value: "production"
        - name: LOG_LEVEL
          value: "INFO"
        - name: WORKERS
          value: "4"
        - name: MAX_CONNECTIONS
          value: "100"
        
        # NFL integrations
        - name: NFL_GMS_API_URL
          valueFrom:
            configMapKeyRef:
              name: evergame-360-config
              key: nfl_gms_api_url
        - name: NFL_GMS_API_KEY
          valueFrom:
            secretKeyRef:
              name: nfl-api-credentials
              key: gms_api_key
        
        # Sentrais integration
        - name: SENTRAIS_API_URL
          valueFrom:
            configMapKeyRef:
              name: evergame-360-config
              key: sentrais_api_url
        - name: SENTRAIS_API_KEY
          valueFrom:
            secretKeyRef:
              name: sentrais-credentials
              key: api_key
        
        resources:
          requests:
            memory: "4Gi"
            cpu: "2000m"
          limits:
            memory: "8Gi"
            cpu: "4000m"
        
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        
        securityContext:
          runAsNonRoot: true
          runAsUser: 1000
          readOnlyRootFilesystem: true
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - ALL
        
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: cache
          mountPath: /app/cache
      
      volumes:
      - name: tmp
        emptyDir: {}
      - name: cache
        emptyDir: {}
      
      imagePullSecrets:
      - name: ghcr-credentials
---
apiVersion: v1
kind: Service
metadata:
  name: evergame-360-core
  namespace: production
  labels:
    app: evergame-360
    component: core
spec:
  type: ClusterIP
  ports:
  - name: http
    port: 80
    targetPort: http
    protocol: TCP
  - name: metrics
    port: 9090
    targetPort: metrics
    protocol: TCP
  selector:
    app: evergame-360
    component: core
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: evergame-360-core
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: evergame-360-core
  minReplicas: 5
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 4
        periodSeconds: 30
      selectPolicy: Max
```

---

## 🚀 DEPLOYMENT AUTOMATION

### Blue-Green Deployment Script

**File**: `scripts/deploy_production.sh`

```bash
#!/bin/bash
# EVERGAME 360 Production Deployment
# Blue-Green strategy with automated rollback

set -e

# Configuration
VERSION=${1:?"Version required (e.g., v5.1)"}
NAMESPACE="production"
CLUSTER_NAME="evergame-360-prod"
AWS_REGION="us-east-1"

echo "🚀 EVERGAME 360 Production Deployment"
echo "   Version: $VERSION"
echo "   Namespace: $NAMESPACE"
echo "   Cluster: $CLUSTER_NAME"
echo ""

# 1. Configure kubectl
echo "→ Configuring kubectl..."
aws eks update-kubeconfig \
    --region $AWS_REGION \
    --name $CLUSTER_NAME

# 2. Pre-deployment validation
echo "→ Running pre-deployment validation..."
kubectl get nodes
kubectl get pods -n $NAMESPACE

# 3. Database migrations
echo "→ Running database migrations..."
kubectl apply -f kubernetes/jobs/db-migration-$VERSION.yaml
kubectl wait --for=condition=complete --timeout=600s job/db-migration-$VERSION -n $NAMESPACE

# 4. Deploy GREEN environment
echo "→ Deploying GREEN environment (version $VERSION)..."
kubectl apply -f kubernetes/deployments/evergame-360-core-green.yaml
kubectl apply -f kubernetes/deployments/evergame-360-api-green.yaml
kubectl apply -f kubernetes/deployments/evergame-360-websocket-green.yaml

# 5. Wait for GREEN to be ready
echo "→ Waiting for GREEN environment to be ready..."
kubectl wait --for=condition=available --timeout=600s deployment/evergame-360-core-green -n $NAMESPACE
kubectl wait --for=condition=available --timeout=600s deployment/evergame-360-api-green -n $NAMESPACE
kubectl wait --for=condition=available --timeout=600s deployment/evergame-360-websocket-green -n $NAMESPACE

# 6. Health checks on GREEN
echo "→ Running health checks on GREEN..."
GREEN_POD=$(kubectl get pod -n $NAMESPACE -l app=evergame-360,environment=green -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n $NAMESPACE $GREEN_POD -- curl -f http://localhost:8000/health || {
    echo "❌ Health check failed on GREEN environment!"
    echo "→ Rolling back..."
    kubectl delete -f kubernetes/deployments/evergame-360-*-green.yaml
    exit 1
}

# 7. Smoke tests on GREEN
echo "→ Running smoke tests..."
kubectl apply -f kubernetes/jobs/smoke-test-$VERSION.yaml
kubectl wait --for=condition=complete --timeout=300s job/smoke-test-$VERSION -n $NAMESPACE || {
    echo "❌ Smoke tests failed!"
    echo "→ Rolling back..."
    kubectl delete -f kubernetes/deployments/evergame-360-*-green.yaml
    exit 1
}

# 8. Switch traffic to GREEN (update service selectors)
echo "→ Switching traffic to GREEN..."
kubectl patch service evergame-360-core -n $NAMESPACE -p '{"spec":{"selector":{"environment":"green"}}}'
kubectl patch service evergame-360-api -n $NAMESPACE -p '{"spec":{"selector":{"environment":"green"}}}'
kubectl patch service evergame-360-websocket -n $NAMESPACE -p '{"spec":{"selector":{"environment":"green"}}}'

# 9. Monitor for 5 minutes
echo "→ Monitoring GREEN environment for 5 minutes..."
sleep 300

# 10. Check error rates
ERROR_RATE=$(kubectl exec -n $NAMESPACE $GREEN_POD -- curl -s http://localhost:9090/metrics | grep error_rate | awk '{print $2}')
if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
    echo "❌ Error rate too high: $ERROR_RATE"
    echo "→ Rolling back to BLUE..."
    kubectl patch service evergame-360-core -n $NAMESPACE -p '{"spec":{"selector":{"environment":"blue"}}}'
    kubectl patch service evergame-360-api -n $NAMESPACE -p '{"spec":{"selector":{"environment":"blue"}}}'
    kubectl patch service evergame-360-websocket -n $NAMESPACE -p '{"spec":{"selector":{"environment":"blue"}}}'
    exit 1
fi

# 11. Deployment successful - clean up BLUE
echo "→ Deployment successful! Cleaning up BLUE environment..."
kubectl delete deployment evergame-360-core-blue -n $NAMESPACE
kubectl delete deployment evergame-360-api-blue -n $NAMESPACE
kubectl delete deployment evergame-360-websocket-blue -n $NAMESPACE

# 12. Rename GREEN to BLUE (for next deployment)
kubectl label deployment evergame-360-core-green environment=blue --overwrite -n $NAMESPACE
kubectl label deployment evergame-360-api-green environment=blue --overwrite -n $NAMESPACE
kubectl label deployment evergame-360-websocket-green environment=blue --overwrite -n $NAMESPACE

# 13. Send notification
echo "→ Sending deployment notification..."
curl -X POST $SLACK_WEBHOOK_DEPLOYMENTS \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"✅ EVERGAME 360 $VERSION deployed successfully to production!\"}"

echo "✅ Deployment complete!"
echo "   Version: $VERSION"
echo "   Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

---

## 📈 MONITORING & OBSERVABILITY

### CloudWatch Dashboards

**File**: `monitoring/cloudwatch-dashboard.json`

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          [ "AWS/EKS", "cluster_node_count", { "stat": "Average" } ],
          [ ".", "cluster_failed_node_count", { "stat": "Sum" } ]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "EKS Cluster Health",
        "yAxis": {
          "left": {
            "min": 0
          }
        }
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          [ "AWS/RDS", "CPUUtilization", { "stat": "Average" } ],
          [ ".", "DatabaseConnections", { "stat": "Sum" } ],
          [ ".", "ReadLatency", { "stat": "Average" } ],
          [ ".", "WriteLatency", { "stat": "Average" } ]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "RDS Performance"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          [ "AWS/ElastiCache", "CPUUtilization", { "stat": "Average" } ],
          [ ".", "CurrConnections", { "stat": "Sum" } ],
          [ ".", "NetworkBytesIn", { "stat": "Sum" } ],
          [ ".", "NetworkBytesOut", { "stat": "Sum" } ]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "Redis Performance"
      }
    }
  ]
}
```

---

## 🎯 44-DAY IMPLEMENTATION TIMELINE

### Week 1 (Nov 21-27): Infrastructure Provisioning
- [ ] Execute Terraform to create EKS cluster
- [ ] Provision RDS PostgreSQL Multi-AZ
- [ ] Setup ElastiCache Redis cluster
- [ ] Configure VPC, subnets, security groups
- [ ] Setup IAM roles and policies

### Week 2 (Nov 28-Dec 4): Kubernetes Configuration
- [ ] Deploy cluster autoscaler
- [ ] Deploy AWS Load Balancer Controller
- [ ] Setup namespaces and RBAC
- [ ] Configure secrets from AWS Secrets Manager
- [ ] Deploy monitoring stack (Prometheus, Grafana)

### Week 3 (Dec 5-11): Application Deployment (Staging)
- [ ] Deploy EVERGAME 360 core to staging
- [ ] Deploy API services to staging
- [ ] Deploy WebSocket services to staging
- [ ] Configure Sentrais integration
- [ ] Configure NFL iOS integration

### Week 4 (Dec 12-18): Integration Testing
- [ ] End-to-end integration tests
- [ ] Load testing (238 concurrent GDAs)
- [ ] Failover testing
- [ ] Security penetration testing
- [ ] Performance optimization

### Week 5 (Dec 19-25): Production Deployment
- [ ] Blue-green deployment to production
- [ ] Smoke tests in production
- [ ] Monitor for 48 hours
- [ ] Optimize based on real traffic

### Week 6 (Dec 26-Jan 1): Game Day Prep
- [ ] Final validation with Caesars Superdome
- [ ] GDA training on production system
- [ ] Incident response drills
- [ ] Create runbooks for game day

### Week 7 (Jan 2-4): Live Game Day
- [ ] Pre-game validation (T-6 hours)
- [ ] Real-time monitoring during game
- [ ] Post-game analysis
- [ ] Capture lessons learned

---

**Document Status**: ✅ PRODUCTION-READY  
**Next Review**: December 1, 2025  
**Owner**: DevOps + Platform Team
