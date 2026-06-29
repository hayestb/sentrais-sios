# NFLIT360 Development Handoff Document
## EVERGAME 4.0 MVP - Architecture Comparison & Implementation Roadmap

**Version:** 8.4.0
**Date:** December 2024
**Status:** Frontend Prototype Complete

---

## Executive Summary

NFLIT360 is the operational platform for NFL Game Day Assistants (GDAs) managing technology readiness for game events. The current build implements a comprehensive frontend prototype with mock API backend, representing approximately **75% of core business logic**.

### Current State
- **325 tests passing** across 7 test suites
- Complete React frontend with Zustand state management
- Mock API layer with localStorage persistence
- Offline-first architecture with sync queue
- Role-based access control (RBAC) enforcement

### Primary Gaps
1. No production backend infrastructure
2. No mobile application (React Native)
3. No real-time push notifications (WebSocket/SSE)
4. No S3 evidence storage integration
5. No PostgreSQL database

---

## Architecture Comparison

### 1. Frontend Layer

| Capability | EVERGAME Spec | Current Build | Status |
|------------|---------------|---------------|--------|
| React 18 SPA | Required | ✅ Implemented | Complete |
| Zustand State | Required | ✅ 6 stores | Complete |
| Temporal Lock UI | Required | ✅ Full support | Complete |
| Readiness Dashboard | Required | ✅ Implemented | Complete |
| Issue Management | Required | ✅ Full CRUD | Complete |
| Evidence Capture | Required | ⚠️ Mock only | Partial |
| Offline Support | Required | ✅ Queue + Cache | Complete |
| React Native Mobile | Required | ❌ Not started | Missing |

### 2. Business Logic

| Capability | EVERGAME Spec | Current Build | Status |
|------------|---------------|---------------|--------|
| Lock State Machine | 4 states | ✅ Implemented | Complete |
| Temporal Milestones | M1-M6 | ✅ Implemented | Complete |
| Override Workflow | Dual approval | ✅ Implemented | Complete |
| Issue Escalation | SLA-based | ✅ Implemented | Complete |
| Readiness Calculator | Weighted % | ✅ Implemented | Complete |
| Assignment Rules | Role-based | ✅ Implemented | Complete |
| Evidence Validation | Required | ⚠️ Mock validation | Partial |

### 3. Backend Infrastructure

| Capability | EVERGAME Spec | Current Build | Status |
|------------|---------------|---------------|--------|
| Node.js/NestJS | Required | ❌ Mock handlers | Missing |
| PostgreSQL | Required | ❌ localStorage | Missing |
| Redis Cache | Required | ❌ Memory only | Missing |
| S3 Storage | Required | ❌ Base64 mock | Missing |
| WebSocket/SSE | Required | ❌ Polling only | Missing |
| JWT Auth | Required | ⚠️ Mock tokens | Partial |

### 4. Integration Points

| System | EVERGAME Spec | Current Build | Status |
|--------|---------------|---------------|--------|
| NFL Calendar API | Required | ❌ Mock data | Missing |
| SSO Integration | Required | ❌ Mock auth | Missing |
| SMS/Push Notifications | Required | ❌ Console log | Missing |
| Audit Logging | Required | ⚠️ Console only | Partial |

---

## Implementation Roadmap

### Phase 1: Backend Foundation (Weeks 1-4)

#### 1.1 Database Layer
```
Priority: CRITICAL
Effort: 2 weeks
```

**PostgreSQL Schema:**
```sql
-- Core Tables Required
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('GDA', 'GDA_SUPERVISOR', 'CONTROL_ROOM', 'NFL_OPS')),
  certifications JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nfl_game_id VARCHAR(50) UNIQUE,
  venue_id UUID REFERENCES venues(id),
  home_team VARCHAR(10) NOT NULL,
  away_team VARCHAR(10) NOT NULL,
  kickoff_time TIMESTAMPTZ NOT NULL,
  week_number INTEGER,
  season INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id),
  template_id UUID REFERENCES playbook_templates(id),
  lock_state VARCHAR(20) DEFAULT 'UNLOCKED',
  lock_changed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id UUID REFERENCES playbooks(id),
  system_id VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  milestone VARCHAR(10),
  assigned_to UUID REFERENCES users(id),
  evidence_required BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id),
  system_id VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  reported_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  resolution JSONB,
  escalation_history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id),
  issue_id UUID REFERENCES issues(id),
  type VARCHAR(20) NOT NULL,
  s3_key VARCHAR(500),
  filename VARCHAR(255),
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id),
  user_id UUID REFERENCES users(id),
  system_id VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, user_id, system_id)
);
```

#### 1.2 API Server
```
Priority: CRITICAL
Effort: 2 weeks
```

**NestJS Structure:**
```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/           # JWT + SSO
│   │   ├── games/          # Game management
│   │   ├── playbooks/      # Playbook + Lock states
│   │   ├── tasks/          # Task management
│   │   ├── issues/         # Issue tracking
│   │   ├── evidence/       # S3 uploads
│   │   ├── assignments/    # GDA assignments
│   │   ├── notifications/  # Push + WebSocket
│   │   └── users/          # User management
│   ├── shared/
│   │   ├── guards/         # RBAC guards
│   │   ├── interceptors/   # Logging, transform
│   │   └── decorators/     # Custom decorators
│   └── main.ts
├── prisma/
│   └── schema.prisma
└── test/
```

### Phase 2: Real-Time Infrastructure (Weeks 5-6)

#### 2.1 WebSocket Gateway
```typescript
// notifications.gateway.ts
@WebSocketGateway({ cors: true })
export class NotificationsGateway {
  @SubscribeMessage('subscribe:game')
  handleGameSubscription(client: Socket, gameId: string) {
    client.join(`game:${gameId}`);
  }

  broadcastToGame(gameId: string, event: string, data: any) {
    this.server.to(`game:${gameId}`).emit(event, data);
  }
}
```

#### 2.2 Event Types
```typescript
enum GameEvent {
  TASK_COMPLETED = 'task:completed',
  ISSUE_CREATED = 'issue:created',
  ISSUE_ESCALATED = 'issue:escalated',
  LOCK_STATE_CHANGED = 'lockState:changed',
  MILESTONE_PASSED = 'milestone:passed',
  READINESS_UPDATED = 'readiness:updated'
}
```

### Phase 3: Evidence Storage (Week 7)

#### 3.1 S3 Integration
```typescript
// evidence.service.ts
@Injectable()
export class EvidenceService {
  async getPresignedUploadUrl(filename: string, contentType: string) {
    const key = `evidence/${Date.now()}/${filename}`;
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: contentType
    });
    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 300 });
    return { uploadUrl: url, key };
  }

  async getPresignedDownloadUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
```

### Phase 4: Mobile Application (Weeks 8-12)

#### 4.1 React Native Structure
```
mobile/
├── src/
│   ├── screens/
│   │   ├── Dashboard/
│   │   ├── TaskList/
│   │   ├── IssueReport/
│   │   ├── EvidenceCapture/
│   │   └── GameDetail/
│   ├── components/
│   ├── hooks/           # Shared with web
│   ├── stores/          # Shared with web
│   └── services/
├── ios/
└── android/
```

#### 4.2 Shared Code Strategy
```
packages/
├── shared/              # Shared between web and mobile
│   ├── hooks/
│   ├── stores/
│   ├── utils/
│   └── constants/
├── web/                 # Web-specific
└── mobile/              # Mobile-specific
```

---

## API Contract Specifications

### Authentication

```yaml
POST /api/v1/auth/login:
  request:
    email: string
    password: string
  response:
    accessToken: string
    refreshToken: string
    user: User

POST /api/v1/auth/refresh:
  request:
    refreshToken: string
  response:
    accessToken: string
```

### Games

```yaml
GET /api/v1/games:
  query:
    week?: number
    season?: number
  response: Game[]

GET /api/v1/games/{id}:
  response: Game

GET /api/v1/games/{id}/detail:
  response:
    game: Game
    readiness: ReadinessData
    playbook: Playbook
    assignments: Assignment[]
```

### Playbooks

```yaml
GET /api/v1/playbooks/{id}:
  response:
    playbook: Playbook
    tasks: Task[]
    lockState: LockStateInfo

PUT /api/v1/playbooks/{id}/lock:
  request:
    state: 'SOFT_LOCK' | 'HARD_LOCK' | 'CLOSED'
  response:
    lockState: LockStateInfo

POST /api/v1/playbooks/{id}/override:
  request:
    taskId: string
    reason: string
    requestedBy: string
  response:
    overrideRequest: OverrideRequest
```

### Tasks

```yaml
GET /api/v1/tasks:
  query:
    playbookId?: string
    status?: string
    assignedTo?: string
  response: Task[]

PUT /api/v1/tasks/{id}:
  request:
    status?: 'pending' | 'in_progress' | 'completed' | 'blocked'
    evidence?: string[]
    notes?: string
  response: Task

POST /api/v1/tasks/{id}/evidence:
  request:
    file: File (multipart)
    type: 'photo' | 'document' | 'screenshot'
  response:
    evidenceId: string
    url: string
```

### Issues

```yaml
GET /api/v1/issues:
  query:
    gameId?: string
    status?: string
    severity?: string
  response: Issue[]

POST /api/v1/issues:
  request:
    gameId: string
    systemId: string
    title: string
    description?: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    category: string
  response: Issue

PUT /api/v1/issues/{id}/escalate:
  request:
    reason: string
    newSeverity?: string
  response: Issue

PUT /api/v1/issues/{id}/resolve:
  request:
    resolution: string
    evidence?: string[]
  response: Issue
```

### Assignments

```yaml
GET /api/v1/assignments:
  query:
    gameId?: string
    userId?: string
  response: Assignment[]

POST /api/v1/assignments:
  request:
    gameId: string
    userId: string
    systemId: string
  response: Assignment

PUT /api/v1/assignments/{id}/check-in:
  response: Assignment

PUT /api/v1/assignments/{id}/check-out:
  response: Assignment
```

### Notifications

```yaml
GET /api/v1/notifications:
  query:
    userId: string
    unreadOnly?: boolean
  response: Notification[]

PUT /api/v1/notifications/{id}/read:
  response: { success: true }

PUT /api/v1/notifications/read-all:
  query:
    userId: string
  response: { success: true }
```

---

## Current File Structure

```
NFLIT360/
├── src/
│   ├── components/
│   │   ├── ConnectedComponents.jsx    # Container components (Phase 6)
│   │   ├── Dashboard.jsx              # Main dashboard
│   │   ├── GameCard.jsx               # Game display
│   │   ├── IssuePanel.jsx             # Issue management
│   │   ├── NotificationCenter.jsx     # Notifications UI
│   │   ├── PlaybookEditor.jsx         # Playbook/task editing
│   │   └── TimelineProgress.jsx       # Milestone timeline
│   │
│   ├── hooks/
│   │   ├── useApi.js                  # Generic fetch hook
│   │   ├── useAPI.js                  # Domain-specific hooks
│   │   └── index.js                   # Hook exports
│   │
│   ├── stores/
│   │   ├── authStore.js               # Authentication state
│   │   ├── gamesStore.js              # Games state
│   │   ├── tasksStore.js              # Tasks state
│   │   ├── issuesStore.js             # Issues state
│   │   ├── staffStore.js              # Staff/users state
│   │   ├── uiStore.js                 # UI state
│   │   ├── PlaybookStore.js           # Playbook state
│   │   ├── NotificationStore.js       # Notification state
│   │   ├── SyncQueue.js               # Offline queue
│   │   ├── Cache.js                   # Response cache
│   │   └── index.js                   # Store exports
│   │
│   ├── services/
│   │   ├── apiClient.js               # API client with mock handlers
│   │   ├── api.js                     # API service layer
│   │   └── assignments.js             # Assignment service
│   │
│   ├── constants/
│   │   ├── lock-states.js             # Lock state definitions
│   │   ├── issue-management.js        # Issue constants
│   │   ├── notification-config.js     # Notification types
│   │   └── index.js                   # Constant exports
│   │
│   ├── data/
│   │   ├── playbooks.js               # Mock playbook data
│   │   └── venues.js                  # Mock venue data
│   │
│   ├── tests/
│   │   ├── stores.test.js             # Store tests
│   │   ├── phase1-lock-states.test.js # Lock state tests
│   │   ├── phase2-playbook.test.js    # Playbook tests
│   │   ├── phase3-notifications.test.js # Notification tests
│   │   ├── phase4-issues.test.js      # Issue tests
│   │   ├── phase5-hooks.test.js       # Hook tests
│   │   └── phase6-connected.test.js   # Integration tests
│   │
│   └── styles/
│       └── index.css                  # All styles (~1500 lines)
│
├── docs/
│   └── HANDOFF.md                     # This document
│
└── package.json
```

---

## Testing Strategy

### Current Test Coverage
- **325 tests** across 7 test suites
- All passing as of latest commit

### Test Categories
1. **Unit Tests**: Store operations, utility functions
2. **Integration Tests**: Hook + Store integration
3. **Component Tests**: Connected component behavior
4. **Business Logic Tests**: Lock states, readiness, escalation

### Backend Testing Requirements
```typescript
// E2E tests for API endpoints
describe('Playbook API', () => {
  it('should enforce lock state transitions', async () => {
    // UNLOCKED -> SOFT_LOCK (allowed)
    // SOFT_LOCK -> UNLOCKED (not allowed)
    // HARD_LOCK requires override for changes
  });

  it('should calculate readiness correctly', async () => {
    // Complete tasks and verify percentage
    // Verify milestone thresholds
  });
});
```

---

## Environment Configuration

### Development
```env
# .env.development
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_MOCK_API=true
```

### Production
```env
# .env.production
VITE_API_URL=https://api.nflit360.nfl.com
VITE_WS_URL=wss://api.nflit360.nfl.com
VITE_MOCK_API=false

# Backend
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
AWS_S3_BUCKET=nflit360-evidence
JWT_SECRET=...
NFL_CALENDAR_API_KEY=...
```

---

## Priority Implementation Order

### Critical Path (Must Have for MVP)
1. ✅ Lock state machine
2. ✅ Readiness calculator
3. ✅ Issue management
4. ✅ Offline support
5. ⬜ PostgreSQL database
6. ⬜ NestJS API server
7. ⬜ JWT authentication
8. ⬜ S3 evidence storage

### Important (Should Have)
1. ⬜ WebSocket notifications
2. ⬜ React Native mobile app
3. ⬜ NFL Calendar integration
4. ⬜ SSO integration

### Nice to Have
1. ⬜ Advanced analytics
2. ⬜ Historical reporting
3. ⬜ Predictive readiness

---

## Next Steps

1. **Backend Setup**: Initialize NestJS project with PostgreSQL
2. **API Migration**: Replace mock handlers with real endpoints
3. **Auth Integration**: Implement JWT with SSO passthrough
4. **Evidence Storage**: Configure S3 bucket and presigned URLs
5. **WebSocket**: Add real-time game event broadcasting
6. **Mobile**: Initialize React Native with shared code structure

---

## Contact & Resources

- **Repository**: NFLIT360
- **Branch**: `claude/add-code-handoff-docs-POUFS`
- **Tests**: Run `npm test` (325 tests)
- **Dev Server**: Run `npm run dev`
