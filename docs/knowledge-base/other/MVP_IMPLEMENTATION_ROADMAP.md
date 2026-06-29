# NFLIT360 MVP Implementation Roadmap

**Version:** 8.3.1 → 8.4.0
**Based On:** MVP Technical Specification + Logic Appendices
**Date:** December 19, 2025

---

## Current State (Build 8.3.1)

### Implemented
| Component | File | Status |
|-----------|------|--------|
| GDA Systems Constants | `src/constants/gda-systems.js` | ✅ Complete |
| Dependency Resolver | `src/services/dependency-resolver.js` | ✅ Complete |
| Readiness Calculator | `src/services/readiness-calculator.js` | ✅ Complete |
| API Client | `src/services/apiClient.js` | ✅ Complete |
| Offline Service | `src/services/offlineService.js` | ✅ Complete |
| Evidence Service | `src/services/evidenceService.js` | ✅ Complete |
| API Endpoints Config | `src/config/api-endpoints.js` | ✅ Complete |
| GDA Systems Tests | `src/tests/gda-systems.test.js` | ✅ Complete |

---

## Implementation Phases

### Phase 1: Core Services (Priority: Critical)

#### 1.1 Assignment Service
**File:** `src/services/assignment-service.js`

**Core Rules to Implement:**
```
One GDA → One Position → One System → One Game → One Day
```

**Functions:**
- `validateAssignment(gda, position, game)` - Enforce one-game-per-day rule
- `checkPositionAvailability(position, game)` - Verify position not already filled
- `getAssignmentsByGame(gameId)` - Return all assignments for a game
- `getGDAAssignments(gdaId, dateRange)` - Return GDA's assignments
- `overrideAssignment(assignment, reason, approver)` - NFL Lead override flow

**Position Counts:**
| System | Min | Max |
|--------|-----|-----|
| EFC | 1 | 1 |
| IVRS | 4 | 6 |
| C2P | 2 | 4 |
| SVS | 4 | 6 |
| FTR | 2 | 3 |
| IR_Tech | 1 | 2 |
| O2O | 1 | 2 |
| WiFi | 1 | 2 |
| Hawk_Eye | 1 | 2 |

---

#### 1.2 Issue Management Service
**File:** `src/services/issue-service.js`

**Severity Levels:**
| Level | Response Time | Visibility |
|-------|---------------|------------|
| LOW | Within milestone | GDA, Supervisor |
| MEDIUM | 30 minutes | + NFL Lead |
| HIGH | 15 minutes | + IT Exec (at T-2h) |
| CRITICAL | Immediate | All roles immediately |

**State Machine:**
```
OPEN → IN_PROGRESS → RESOLVED → CLOSED
     → ESCALATED → IN_PROGRESS
     → CANCELLED
```

**Functions:**
- `createIssue(data)` - Create with auto-severity suggestion
- `escalateIssue(issueId, reason)` - Escalate to next level
- `resolveIssue(issueId, resolution, evidence)` - Mark resolved
- `getVisibleIssues(role, gameId, time)` - Time-based visibility filtering
- `autoEscalate(issueId)` - Timer-based auto-escalation

**Auto-Escalation Rules:**
- HIGH unresolved >30 min after T-2h → IT Exec alert
- CRITICAL created → Immediate all-level alert
- Game <90% at T-1h → Conference call triggered

---

#### 1.3 Playbook Lock Service
**File:** `src/services/playbook-service.js`

**Lock States:**
| State | Time Window | Edit Authority |
|-------|-------------|----------------|
| UNLOCKED | T-14d to T-4h | NFL Lead (no approval needed) |
| SOFT LOCK | T-4h to T-1h | NFL Lead (must justify) |
| HARD LOCK | T-1h to T+4h | IT Exec approval required |
| CLOSED | After T+4h | No edits allowed |

**Playbook Hierarchy:**
```
Master Playbook
  └── Venue Playbook (stadium-specific)
      └── System Playbook (per GDA system)
          └── Game Instance Playbook (per game)
```

**Functions:**
- `getPlaybook(gameId, systemId)` - Get merged playbook
- `getLockState(gameId, currentTime)` - Determine lock state
- `canEdit(role, gameId, currentTime)` - Check edit permission
- `requestOverride(gameId, changes, reason)` - Submit override request
- `approveOverride(overrideId, approverId)` - IT Exec approval
- `getEditHistory(gameId)` - Audit trail

**Override Request Flow:**
1. NFL Lead submits changes + reason
2. System creates pending override
3. IT Exec receives notification
4. IT Exec approves/denies
5. If approved: changes applied, audit logged
6. If denied: notification sent, no changes

---

### Phase 2: Notification Engine

#### 2.1 Notification Service
**File:** `src/services/notification-service.js`

**Routing Matrix:**
| Event | IT Exec | NFL Lead | Supervisor | GDA |
|-------|---------|----------|------------|-----|
| Milestone breach | Push | Push | Push | - |
| Task blocked | - | Feed | Push | Push |
| Task unblocked | - | Feed | Push | Push |
| Issue CRITICAL | Push | Push | Push | - |
| Issue HIGH (T-2h) | Push | Push | Push | - |
| 100% readiness | Push | Push | Push | - |
| Kickoff | Push | Push | Push | Push |

**Functions:**
- `notify(event, payload, roles)` - Route notification
- `getNotificationsByRole(role, userId)` - Get user's notifications
- `markRead(notificationId)` - Mark as read
- `getUnreadCount(userId)` - Badge count

---

### Phase 3: Real-Time Integration

#### 3.1 WebSocket Manager
**File:** `src/services/websocket-service.js`

**Channels (from api-endpoints.js):**
- `game-{gameId}` - Readiness updates
- `game-{gameId}-issues` - Issue events
- `dashboard-exec` - Executive dashboard
- `dashboard-lead-{gameId}` - Lead dashboard

**Events:**
- `readiness:update` - Percentage change
- `task:status` - Task state change
- `issue:created` - New issue
- `issue:escalated` - Issue escalated
- `milestone:reached` - Milestone threshold met
- `gate:unblocked` - Gatekeeper completion

---

### Phase 4: UI Components

#### 4.1 Dashboard Updates
- **Executive Dashboard:** League-wide game grid with color-coded status
- **Lead Dashboard:** Single game focus with GDA status and issues
- **Supervisor Console:** Team coordination with task assignments
- **GDA App:** Task list with dependency status and evidence capture

#### 4.2 New Components Needed
- `IssuePanel.jsx` - Issue management UI
- `PlaybookEditor.jsx` - Playbook editing with lock awareness
- `OverrideRequestModal.jsx` - Override request form
- `NotificationCenter.jsx` - Notification dropdown
- `TimelineProgress.jsx` - Temporal milestone visualization

---

## Test Coverage Requirements

### Unit Tests
- Assignment validation rules
- Issue state machine transitions
- Playbook lock state calculations
- Notification routing logic

### Integration Tests
- Assignment + Readiness integration
- Issue escalation + Notification flow
- Playbook override + Audit logging

### E2E Tests
- Full game day lifecycle (T-6h to T+6h)
- Issue creation to resolution flow
- Override request and approval flow

---

## API Integration Points

### EVERGAME 360 (External)
| Endpoint | Purpose |
|----------|---------|
| `/api/v1/games/schedule` | Get game schedule |
| `/api/v1/games/:gameId/assignments` | Sync assignments |
| `/api/v1/playbook/tasks` | Get playbook tasks |
| `/api/v1/tasks/completion` | Submit task completion |

### IT Module (Internal)
| Endpoint | Purpose |
|----------|---------|
| `/api/it/issues` | Issue CRUD |
| `/api/it/readiness/update` | Push readiness updates |
| `/api/it/audit/log` | Write audit entries |
| `/api/notifications/send` | Send notifications |

---

## Migration Notes

### Data Models to Add
```sql
-- Issues table
CREATE TABLE issues (
  id UUID PRIMARY KEY,
  game_id UUID NOT NULL,
  system_id VARCHAR(20),
  severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
  status ENUM('OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED', 'CANCELLED'),
  created_by UUID,
  assigned_to UUID,
  created_at TIMESTAMP,
  resolved_at TIMESTAMP
);

-- Override requests table
CREATE TABLE override_requests (
  id UUID PRIMARY KEY,
  game_id UUID NOT NULL,
  requested_by UUID,
  approved_by UUID,
  status ENUM('PENDING', 'APPROVED', 'DENIED'),
  changes JSONB,
  reason TEXT,
  created_at TIMESTAMP,
  decided_at TIMESTAMP
);
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| All games 100% at kickoff | Goal |
| M2 threshold (T-4h) | ≥70% |
| M3 threshold (T-3h) | ≥90% |
| M4 threshold (T-1h) | =100% |
| Issue resolution within SLA | 95% |
| Override request response | <10 min |

---

**Document Version:** 8.3.1
**Last Updated:** December 19, 2025
**Maintained By:** NFLIT360 Architecture Team
