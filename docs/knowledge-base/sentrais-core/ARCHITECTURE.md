# EVERGAME360 GDA Real-Time Readiness System
## Architecture Design Document

### Executive Summary
A real-time operational readiness platform for Game Day Assistants (GDAs) across multiple NFL venues, providing task management, evidence capture, issue reporting, and executive-level visibility.

---

## 1. SYSTEM OVERVIEW

### 1.1 Purpose
Enable GDAs to efficiently manage game day operations while providing real-time visibility to NFL leadership and executives through a hierarchical dashboard system.

### 1.2 Sentrais Framework Mapping

**Sentrais Framework Principles Applied:**
- **S**ystems Integration: Multi-venue, multi-role coordination
- **E**vent-Driven Architecture: Real-time status updates
- **N**etwork Resilience: Offline-first capabilities
- **T**ask Orchestration: Automated workflow management
- **R**eporting & Analytics: Multi-level dashboards
- **A**lert Management: Escalation protocols
- **I**ntelligence Layer: Predictive readiness scoring
- **S**ecurity & Access Control: Role-based permissions

---

## 2. ARCHITECTURE LAYERS

### 2.1 Presentation Layer (Multi-Role Interfaces)

#### EXEC Dashboard
- **Scope**: All games, all systems, all venues
- **View**: Strategic overview with drill-down capabilities
- **Features**:
  - Live readiness score across all venues
  - Critical issues aggregation
  - Trend analysis & historical comparisons
  - Resource allocation overview
  - Real-time game status grid

#### NFL Lead Dashboard
- **Scope**: Specific game(s) or region(s)
- **View**: Tactical oversight of assigned games
- **Features**:
  - Game-specific readiness metrics
  - Team performance tracking
  - Issue escalation management
  - GDA performance analytics
  - System status monitoring

#### GDA Interface
- **Scope**: Individual venue/position
- **View**: Operational task execution
- **Features**:
  - Task checklist with priority indicators
  - Quick evidence capture (photo/video/notes)
  - Issue reporting with categorization
  - System status checkpoints
  - Communication hub

### 2.2 Application Layer

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                         │
│  - Authentication & Authorization                            │
│  - Rate Limiting & Request Routing                          │
│  - WebSocket Manager (Real-time)                            │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│  Task Service  │  │Issue Service│  │Evidence Service │
│  - CRUD Tasks  │  │ - Report    │  │ - Upload/Store │
│  - Assignment  │  │ - Escalate  │  │ - Retrieve     │
│  - Completion  │  │ - Resolve   │  │ - Thumbnail    │
└────────────────┘  └─────────────┘  └─────────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│              Readiness Calculation Engine                    │
│  - Real-time scoring algorithm                              │
│  - Multi-location aggregation                               │
│  - Predictive analytics                                     │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                  Event Stream Processor                      │
│  - Task completion events                                   │
│  - Issue creation/resolution events                         │
│  - Status change events                                     │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Data Layer

#### Core Entities
1. **Venue** (Stadium/Location)
2. **Game** (Event instance)
3. **System** (Technology/Infrastructure component)
4. **Position** (GDA assignment location)
5. **Task** (Checklist item)
6. **Issue** (Problem report)
7. **Evidence** (Multimedia attachments)
8. **User** (EXEC/NFL Lead/GDA)

---

## 3. MULTI-LOCATION FUNCTIONALITY

### 3.1 Location Hierarchy

```
NFL Organization (Root)
│
├── Region: East
│   ├── Venue: MetLife Stadium
│   │   ├── Game: NYG vs DAL (2024-11-28)
│   │   │   ├── Position: Gate A
│   │   │   ├── Position: Suite Level
│   │   │   └── Position: Field Operations
│   │   └── Systems
│   │       ├── Ticketing System
│   │       ├── Video Board System
│   │       └── WiFi Infrastructure
│   │
│   └── Venue: Gillette Stadium
│       └── ...
│
├── Region: West
│   └── ...
│
└── Region: Central
    └── ...
```

### 3.2 Multi-Position System Support

When a system (e.g., "WiFi Infrastructure") spans multiple positions:
- Each position has specific tasks related to that system
- System-level readiness is aggregated across all positions
- Issues can be tagged as position-specific or system-wide
- Escalation routes through both position hierarchy and system ownership

**Example: WiFi System Across Stadium**

| Position | Tasks | Status |
|----------|-------|--------|
| Concourse North | Test access points 1-25 | ✅ Complete |
| Concourse South | Test access points 26-50 | ⚠️ In Progress |
| Suite Level | Test VIP network | ❌ Issue Reported |
| Press Box | Test media network | ✅ Complete |

**Aggregated System Status**: 75% Ready (3/4 complete, 1 issue)

---

## 4. DATA MODEL

### 4.1 Core Schema

```sql
-- Venues & Games
CREATE TABLE venues (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE,
    region VARCHAR(50),
    capacity INTEGER,
    timezone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE games (
    id UUID PRIMARY KEY,
    venue_id UUID REFERENCES venues(id),
    home_team VARCHAR(50),
    away_team VARCHAR(50),
    game_date TIMESTAMP NOT NULL,
    game_type VARCHAR(20), -- Regular, Playoff, Preseason
    nfl_lead_id UUID REFERENCES users(id),
    status VARCHAR(20), -- Scheduled, InProgress, Completed
    created_at TIMESTAMP DEFAULT NOW()
);

-- Positions & Assignments
CREATE TABLE positions (
    id UUID PRIMARY KEY,
    venue_id UUID REFERENCES venues(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    location_description TEXT,
    parent_position_id UUID REFERENCES positions(id), -- For hierarchical positions
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE systems (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- Technology, Operations, Safety, Fan Experience
    description TEXT,
    criticality VARCHAR(20), -- Critical, High, Medium, Low
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE position_systems (
    id UUID PRIMARY KEY,
    position_id UUID REFERENCES positions(id),
    system_id UUID REFERENCES systems(id),
    is_primary_owner BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(position_id, system_id)
);

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    game_id UUID REFERENCES games(id),
    position_id UUID REFERENCES positions(id),
    system_id UUID REFERENCES systems(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    priority VARCHAR(20), -- Critical, High, Medium, Low
    category VARCHAR(100),
    assigned_to UUID REFERENCES users(id),
    due_time TIMESTAMP,
    completion_time TIMESTAMP,
    status VARCHAR(20), -- Pending, InProgress, Completed, Blocked
    completion_notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Issues
CREATE TABLE issues (
    id UUID PRIMARY KEY,
    game_id UUID REFERENCES games(id),
    position_id UUID REFERENCES positions(id),
    system_id UUID REFERENCES systems(id),
    task_id UUID REFERENCES tasks(id), -- Optional: link to specific task
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20), -- Critical, High, Medium, Low
    category VARCHAR(100),
    status VARCHAR(20), -- Open, InProgress, Resolved, Escalated
    reported_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    resolved_by UUID REFERENCES users(id),
    reported_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    escalation_level INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Evidence
CREATE TABLE evidence (
    id UUID PRIMARY KEY,
    task_id UUID REFERENCES tasks(id),
    issue_id UUID REFERENCES issues(id),
    type VARCHAR(20), -- Photo, Video, Document, Note
    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(100),
    thumbnail_path VARCHAR(500),
    caption TEXT,
    metadata JSONB, -- GPS, timestamp, device info, etc.
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Users & Roles
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20), -- EXEC, NFL_LEAD, GDA
    phone VARCHAR(20),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_assignments (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    game_id UUID REFERENCES games(id),
    position_id UUID REFERENCES positions(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, game_id, position_id)
);

-- Readiness Tracking
CREATE TABLE readiness_scores (
    id UUID PRIMARY KEY,
    game_id UUID REFERENCES games(id),
    position_id UUID REFERENCES positions(id),
    system_id UUID REFERENCES systems(id),
    score DECIMAL(5,2), -- 0-100
    tasks_total INTEGER,
    tasks_completed INTEGER,
    issues_open INTEGER,
    issues_critical INTEGER,
    calculated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_game_readiness (game_id, calculated_at),
    INDEX idx_position_readiness (position_id, calculated_at)
);

-- Event Log (for audit and analytics)
CREATE TABLE event_log (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50), -- TaskCompleted, IssueReported, etc.
    entity_type VARCHAR(50), -- Task, Issue, etc.
    entity_id UUID,
    user_id UUID REFERENCES users(id),
    game_id UUID REFERENCES games(id),
    data JSONB,
    timestamp TIMESTAMP DEFAULT NOW(),
    INDEX idx_event_type_time (event_type, timestamp),
    INDEX idx_game_events (game_id, timestamp)
);
```

---

## 5. REAL-TIME COMMUNICATION

### 5.1 WebSocket Architecture

```javascript
// WebSocket Channels
const CHANNELS = {
    EXEC_OVERVIEW: 'exec:overview',          // All games, all venues
    NFL_LEAD_GAME: 'nfl_lead:game:{gameId}', // Specific game
    GDA_POSITION: 'gda:position:{positionId}:{gameId}', // Specific position
    SYSTEM_STATUS: 'system:{systemId}:{gameId}', // System-wide updates
};

// Event Types
const EVENT_TYPES = {
    TASK_COMPLETED: 'task.completed',
    TASK_UPDATED: 'task.updated',
    ISSUE_REPORTED: 'issue.reported',
    ISSUE_ESCALATED: 'issue.escalated',
    ISSUE_RESOLVED: 'issue.resolved',
    READINESS_UPDATED: 'readiness.updated',
    ALERT_TRIGGERED: 'alert.triggered',
};
```

### 5.2 Offline-First Capabilities

- Local storage for task completion
- Queue for evidence upload
- Sync on reconnection
- Conflict resolution strategy

---

## 6. READINESS CALCULATION ALGORITHM

### 6.1 Position-Level Readiness Score

```python
def calculate_position_readiness(position_id, game_id):
    """
    Calculate readiness score for a position (0-100)
    """
    # Get all tasks for this position
    tasks = get_tasks(position_id, game_id)
    
    # Weighted completion
    total_weight = 0
    completed_weight = 0
    
    for task in tasks:
        weight = PRIORITY_WEIGHTS[task.priority]
        total_weight += weight
        if task.status == 'Completed':
            completed_weight += weight
    
    task_score = (completed_weight / total_weight) * 70 if total_weight > 0 else 0
    
    # Issue penalty
    issues = get_open_issues(position_id, game_id)
    critical_issues = len([i for i in issues if i.severity == 'Critical'])
    high_issues = len([i for i in issues if i.severity == 'High'])
    
    issue_penalty = (critical_issues * 15) + (high_issues * 5)
    
    # Time factor (closer to game time, higher penalty for incomplete)
    time_to_game = get_time_to_game(game_id)
    time_factor = calculate_time_pressure(time_to_game, tasks)
    
    readiness_score = max(0, task_score - issue_penalty + time_factor)
    
    return min(100, readiness_score)

PRIORITY_WEIGHTS = {
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1
}
```

### 6.2 System-Level Readiness (Multi-Position)

```python
def calculate_system_readiness(system_id, game_id):
    """
    Aggregate readiness across all positions for a system
    """
    positions = get_system_positions(system_id, game_id)
    
    position_scores = []
    for position in positions:
        score = calculate_position_readiness(position.id, game_id)
        weight = 2 if position.is_primary_owner else 1
        position_scores.append({
            'position': position,
            'score': score,
            'weight': weight
        })
    
    # Weighted average
    total_weight = sum(p['weight'] for p in position_scores)
    weighted_sum = sum(p['score'] * p['weight'] for p in position_scores)
    
    system_score = weighted_sum / total_weight if total_weight > 0 else 0
    
    # System-wide issues (not position-specific)
    system_issues = get_system_wide_issues(system_id, game_id)
    if system_issues:
        # Any critical system-wide issue caps score at 50
        if any(i.severity == 'Critical' for i in system_issues):
            system_score = min(system_score, 50)
    
    return system_score
```

### 6.3 Game-Level Readiness

```python
def calculate_game_readiness(game_id):
    """
    Overall game readiness across all positions and systems
    """
    # Get all systems for this game's venue
    systems = get_game_systems(game_id)
    
    system_scores = []
    for system in systems:
        score = calculate_system_readiness(system.id, game_id)
        weight = CRITICALITY_WEIGHTS[system.criticality]
        system_scores.append({
            'system': system,
            'score': score,
            'weight': weight
        })
    
    total_weight = sum(s['weight'] for s in system_scores)
    weighted_sum = sum(s['score'] * s['weight'] for s in system_scores)
    
    return weighted_sum / total_weight if total_weight > 0 else 0

CRITICALITY_WEIGHTS = {
    'Critical': 5,
    'High': 3,
    'Medium': 2,
    'Low': 1
}
```

---

## 7. API ENDPOINTS

### 7.1 GDA Endpoints

```
POST   /api/v1/tasks/{taskId}/complete
POST   /api/v1/tasks/{taskId}/evidence
POST   /api/v1/issues
GET    /api/v1/positions/{positionId}/games/{gameId}/tasks
GET    /api/v1/positions/{positionId}/games/{gameId}/systems
PUT    /api/v1/issues/{issueId}
```

### 7.2 NFL Lead Endpoints

```
GET    /api/v1/games/{gameId}/readiness
GET    /api/v1/games/{gameId}/positions
GET    /api/v1/games/{gameId}/issues
GET    /api/v1/games/{gameId}/tasks
POST   /api/v1/games/{gameId}/tasks (create/assign tasks)
PUT    /api/v1/issues/{issueId}/escalate
GET    /api/v1/games/{gameId}/gdas (GDA performance)
```

### 7.3 EXEC Endpoints

```
GET    /api/v1/exec/overview
GET    /api/v1/exec/games (all games with filters)
GET    /api/v1/exec/analytics
GET    /api/v1/exec/trends
GET    /api/v1/venues/{venueId}/history
GET    /api/v1/systems/{systemId}/performance
```

---

## 8. DEPLOYMENT ARCHITECTURE

### 8.1 Infrastructure

```
┌──────────────────────────────────────────────────────────────┐
│                    CDN / CloudFront                          │
│  - Static Assets (React App, Images)                        │
└──────────────────────────────────────────────────────────────┘
                            │
┌──────────────────────────────────────────────────────────────┐
│              Load Balancer (Application Layer)               │
└──────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│  API Server 1  │  │API Server 2 │  │  API Server 3   │
│  (Container)   │  │ (Container) │  │  (Container)    │
└────────────────┘  └─────────────┘  └─────────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│   PostgreSQL   │  │    Redis    │  │   S3 Storage    │
│  (Primary DB)  │  │(Cache/Queue)│  │   (Evidence)    │
└────────────────┘  └─────────────┘  └─────────────────┘
```

### 8.2 Technology Stack

**Frontend:**
- React 18+ with TypeScript
- React Query (data fetching/caching)
- Socket.io-client (WebSocket)
- TailwindCSS (styling)
- Chart.js / Recharts (visualizations)
- React Router (navigation)
- Zustand or Redux (state management)

**Backend:**
- Node.js with Express.js or Fastify
- TypeScript
- Socket.io (WebSocket server)
- PostgreSQL (primary database)
- Redis (caching, pub/sub, queues)
- Bull (job queues)
- JWT (authentication)

**Infrastructure:**
- Docker containers
- Kubernetes (orchestration)
- AWS ECS or EKS
- AWS S3 (file storage)
- AWS CloudFront (CDN)
- AWS RDS (managed PostgreSQL)
- AWS ElastiCache (managed Redis)

**Monitoring & Observability:**
- Datadog or New Relic (APM)
- Sentry (error tracking)
- CloudWatch (logs)
- Grafana (metrics visualization)

---

## 9. SECURITY & COMPLIANCE

### 9.1 Authentication & Authorization

```javascript
// Role-Based Access Control (RBAC)
const PERMISSIONS = {
    EXEC: {
        canViewAllGames: true,
        canViewAllVenues: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canExportData: true,
    },
    NFL_LEAD: {
        canViewAssignedGames: true,
        canAssignTasks: true,
        canEscalateIssues: true,
        canViewGDAPerformance: true,
        canManageGDAs: true,
    },
    GDA: {
        canCompleteTasks: true,
        canReportIssues: true,
        canUploadEvidence: true,
        canViewOwnAssignments: true,
        canCommunicate: true,
    }
};
```

### 9.2 Data Protection

- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- PII data anonymization in analytics
- Evidence watermarking
- Audit logging for all actions

---

## 10. INTEGRATION POINTS

### 10.1 External Systems

- **NFL Game Data API**: Game schedules, team info
- **Venue Management Systems**: Facility data
- **Ticketing Systems**: Attendance data
- **Security Systems**: Incident reports
- **Communication Platforms**: SMS/Email notifications

### 10.2 Export Capabilities

- CSV/Excel (for offline analysis)
- PDF reports (game summaries)
- API for third-party integrations
- PowerBI/Tableau connectors

---

## 11. SUCCESS METRICS

### 11.1 Operational KPIs

- Average readiness score by venue
- Task completion rate (by time to game)
- Issue resolution time
- Evidence capture rate
- GDA response time

### 11.2 System Performance KPIs

- API response time (<200ms p95)
- WebSocket latency (<100ms)
- Upload success rate (>99%)
- System uptime (99.9%)

---

## 12. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Weeks 1-4)
- Database setup
- Core API development
- Authentication system
- Basic task management

### Phase 2: GDA Interface (Weeks 5-8)
- Task completion UI
- Evidence capture
- Issue reporting
- Offline functionality

### Phase 3: Leadership Dashboards (Weeks 9-12)
- NFL Lead dashboard
- EXEC dashboard
- Real-time updates
- Analytics engine

### Phase 4: Advanced Features (Weeks 13-16)
- Multi-location management
- Predictive analytics
- Mobile optimization
- Integration APIs

### Phase 5: Testing & Launch (Weeks 17-20)
- Load testing
- Security audit
- User training
- Phased rollout

---

## APPENDIX A: Glossary

- **GDA**: Game Day Assistant
- **EXEC**: Executive leadership level
- **NFL Lead**: NFL-specific game/region leader
- **Readiness Score**: Calculated metric (0-100) indicating operational preparedness
- **Position**: Specific location/role within a venue
- **System**: Technology or operational component
- **Evidence**: Multimedia proof of task completion or issue documentation
