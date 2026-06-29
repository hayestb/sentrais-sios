# NFLIT360 API Specification
## RESTful API Contract for EVERGAME 4.0 MVP

**Version:** 1.0.0
**Base URL:** `/api/v1`

---

## Table of Contents
1. [Authentication](#authentication)
2. [Games](#games)
3. [Playbooks](#playbooks)
4. [Tasks](#tasks)
5. [Issues](#issues)
6. [Assignments](#assignments)
7. [Evidence](#evidence)
8. [Users](#users)
9. [Venues](#venues)
10. [Notifications](#notifications)
11. [WebSocket Events](#websocket-events)

---

## Authentication

### POST /auth/login
Authenticate user and receive tokens.

**Request:**
```json
{
  "email": "gda@nfl.com",
  "password": "string"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "email": "gda@nfl.com",
    "name": "John Smith",
    "role": "GDA",
    "certifications": ["EFC", "IVRS", "C2P"]
  }
}
```

**Errors:**
- `401`: Invalid credentials
- `423`: Account locked

### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

### POST /auth/logout
Invalidate refresh token.

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "success": true
}
```

---

## Games

### GET /games
List games with optional filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| week | number | Filter by week number |
| season | number | Filter by season year |
| venue | string | Filter by venue ID |
| from | ISO date | Start date range |
| to | ISO date | End date range |

**Response (200):**
```json
[
  {
    "id": "game-uuid",
    "nflGameId": "2024_REG_01_KC_BAL",
    "homeTeam": "BAL",
    "awayTeam": "KC",
    "venue": {
      "id": "venue-uuid",
      "name": "M&T Bank Stadium",
      "city": "Baltimore"
    },
    "kickoffTime": "2024-09-05T20:20:00Z",
    "week": 1,
    "season": 2024,
    "status": "SCHEDULED",
    "playbookId": "playbook-uuid"
  }
]
```

### GET /games/{id}
Get game by ID.

**Response (200):**
```json
{
  "id": "game-uuid",
  "nflGameId": "2024_REG_01_KC_BAL",
  "homeTeam": "BAL",
  "awayTeam": "KC",
  "venue": {
    "id": "venue-uuid",
    "name": "M&T Bank Stadium",
    "city": "Baltimore",
    "timezone": "America/New_York"
  },
  "kickoffTime": "2024-09-05T20:20:00Z",
  "week": 1,
  "season": 2024,
  "status": "SCHEDULED",
  "playbookId": "playbook-uuid"
}
```

### GET /games/{id}/detail
Get comprehensive game detail with readiness.

**Response (200):**
```json
{
  "game": { /* Game object */ },
  "readiness": {
    "overall": 85,
    "tasksCompleted": 42,
    "tasksTotal": 50,
    "bySystem": {
      "EFC": 100,
      "IVRS": 90,
      "C2P": 75,
      "SVS": 80,
      "FTR": 85,
      "IR_Tech": 90,
      "O2O": 70,
      "WiFi": 95,
      "Hawk_Eye": 85
    },
    "byMilestone": {
      "M1": "passed",
      "M2": "passed",
      "M3": "current",
      "M4": "pending",
      "M5": "pending",
      "M6": "pending"
    }
  },
  "playbook": { /* Playbook object */ },
  "assignments": [ /* Assignment objects */ ],
  "issues": {
    "open": 3,
    "critical": 1
  }
}
```

### GET /games/week/{weekNumber}
Get all games for a specific week.

**Response (200):** Same as GET /games

---

## Playbooks

### GET /playbooks
List playbooks with optional filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| gameId | uuid | Filter by game |
| templateId | uuid | Filter by template |

**Response (200):**
```json
[
  {
    "id": "playbook-uuid",
    "gameId": "game-uuid",
    "templateId": "template-uuid",
    "name": "Week 1 - BAL vs KC",
    "lockState": "SOFT_LOCK",
    "lockChangedAt": "2024-09-05T15:20:00Z",
    "taskCount": 50,
    "completedCount": 42,
    "createdAt": "2024-09-01T00:00:00Z"
  }
]
```

### GET /playbooks/{id}
Get playbook with tasks.

**Response (200):**
```json
{
  "id": "playbook-uuid",
  "gameId": "game-uuid",
  "name": "Week 1 - BAL vs KC",
  "lockState": "SOFT_LOCK",
  "lockChangedAt": "2024-09-05T15:20:00Z",
  "tasks": [
    {
      "id": "task-uuid",
      "systemId": "EFC",
      "title": "Verify EFC tablet connectivity",
      "description": "Confirm all 12 tablets connect to coach headset system",
      "status": "completed",
      "milestone": "M2",
      "priority": "HIGH",
      "evidenceRequired": true,
      "evidence": ["evidence-uuid-1"],
      "assignedTo": "user-uuid",
      "completedAt": "2024-09-05T14:30:00Z"
    }
  ],
  "lockStateInfo": {
    "state": "SOFT_LOCK",
    "changedAt": "2024-09-05T15:20:00Z",
    "changedBy": "user-uuid",
    "overridesAllowed": true,
    "requiresApproval": ["NFL_OPS"],
    "nextState": "HARD_LOCK",
    "nextStateAt": "2024-09-05T18:20:00Z"
  }
}
```

### PUT /playbooks/{id}/lock
Change playbook lock state.

**Request:**
```json
{
  "state": "HARD_LOCK",
  "reason": "T-2h milestone reached"
}
```

**Response (200):**
```json
{
  "id": "playbook-uuid",
  "lockState": "HARD_LOCK",
  "lockChangedAt": "2024-09-05T18:20:00Z",
  "lockStateInfo": {
    "state": "HARD_LOCK",
    "changedAt": "2024-09-05T18:20:00Z",
    "changedBy": "system",
    "overridesAllowed": true,
    "requiresApproval": ["NFL_OPS", "GDA_SUPERVISOR"],
    "nextState": "CLOSED",
    "nextStateAt": "2024-09-05T20:20:00Z"
  }
}
```

**Errors:**
- `400`: Invalid state transition
- `403`: Insufficient permissions

### POST /playbooks/{id}/override
Request an override for locked playbook.

**Request:**
```json
{
  "taskId": "task-uuid",
  "reason": "Equipment replacement required",
  "requestedBy": "user-uuid",
  "changes": {
    "status": "completed",
    "notes": "Replaced faulty cable"
  }
}
```

**Response (201):**
```json
{
  "id": "override-uuid",
  "playbookId": "playbook-uuid",
  "taskId": "task-uuid",
  "status": "PENDING",
  "requestedBy": "user-uuid",
  "requestedAt": "2024-09-05T18:45:00Z",
  "requiredApprovals": ["NFL_OPS", "GDA_SUPERVISOR"],
  "approvals": [],
  "reason": "Equipment replacement required"
}
```

### PUT /playbooks/{id}/override/{overrideId}
Approve or deny override request.

**Request:**
```json
{
  "action": "APPROVE",
  "approvedBy": "user-uuid",
  "notes": "Verified with vendor"
}
```

**Response (200):**
```json
{
  "id": "override-uuid",
  "status": "APPROVED",
  "approvals": [
    {
      "userId": "user-uuid",
      "role": "NFL_OPS",
      "action": "APPROVE",
      "timestamp": "2024-09-05T18:50:00Z"
    }
  ],
  "appliedAt": "2024-09-05T18:50:00Z"
}
```

---

## Tasks

### GET /tasks
List tasks with filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| playbookId | uuid | Filter by playbook |
| gameId | uuid | Filter by game |
| systemId | string | Filter by system (EFC, IVRS, etc.) |
| status | string | pending, in_progress, completed, blocked |
| assignedTo | uuid | Filter by assigned user |
| milestone | string | M1, M2, M3, M4, M5, M6 |

**Response (200):**
```json
[
  {
    "id": "task-uuid",
    "playbookId": "playbook-uuid",
    "systemId": "EFC",
    "title": "Verify EFC tablet connectivity",
    "description": "Confirm all 12 tablets connect to coach headset system",
    "status": "in_progress",
    "milestone": "M2",
    "priority": "HIGH",
    "evidenceRequired": true,
    "evidence": [],
    "assignedTo": {
      "id": "user-uuid",
      "name": "John Smith"
    },
    "startedAt": "2024-09-05T14:00:00Z",
    "createdAt": "2024-09-01T00:00:00Z"
  }
]
```

### GET /tasks/{id}
Get single task.

**Response (200):** Single task object

### PUT /tasks/{id}
Update task status/details.

**Request:**
```json
{
  "status": "completed",
  "notes": "All 12 tablets verified connected",
  "evidence": ["evidence-uuid-1", "evidence-uuid-2"]
}
```

**Response (200):**
```json
{
  "id": "task-uuid",
  "status": "completed",
  "completedAt": "2024-09-05T14:30:00Z",
  "notes": "All 12 tablets verified connected",
  "evidence": ["evidence-uuid-1", "evidence-uuid-2"]
}
```

**Errors:**
- `403`: Playbook locked, override required
- `400`: Evidence required but not provided

### PUT /tasks/{id}/assign
Assign task to user.

**Request:**
```json
{
  "userId": "user-uuid"
}
```

**Response (200):** Updated task object

---

## Issues

### GET /issues
List issues with filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| gameId | uuid | Filter by game |
| systemId | string | Filter by system |
| status | string | open, in_progress, escalated, resolved, closed |
| severity | string | LOW, MEDIUM, HIGH, CRITICAL |
| assignedTo | uuid | Filter by assigned user |
| reportedBy | uuid | Filter by reporter |

**Response (200):**
```json
[
  {
    "id": "issue-uuid",
    "gameId": "game-uuid",
    "systemId": "EFC",
    "title": "Tablet #7 not connecting",
    "description": "Home sideline tablet showing connection error",
    "severity": "HIGH",
    "status": "in_progress",
    "category": "EQUIPMENT",
    "reportedBy": {
      "id": "user-uuid",
      "name": "John Smith"
    },
    "assignedTo": {
      "id": "user-uuid",
      "name": "Jane Doe"
    },
    "createdAt": "2024-09-05T15:00:00Z",
    "slaDeadline": "2024-09-05T16:00:00Z"
  }
]
```

### POST /issues
Create new issue.

**Request:**
```json
{
  "gameId": "game-uuid",
  "systemId": "EFC",
  "title": "Tablet #7 not connecting",
  "description": "Home sideline tablet showing connection error",
  "severity": "HIGH",
  "category": "EQUIPMENT"
}
```

**Response (201):**
```json
{
  "id": "issue-uuid",
  "gameId": "game-uuid",
  "systemId": "EFC",
  "title": "Tablet #7 not connecting",
  "severity": "HIGH",
  "status": "open",
  "category": "EQUIPMENT",
  "reportedBy": {
    "id": "current-user-uuid",
    "name": "Current User"
  },
  "createdAt": "2024-09-05T15:00:00Z",
  "slaDeadline": "2024-09-05T16:00:00Z"
}
```

### PUT /issues/{id}
Update issue details.

**Request:**
```json
{
  "title": "Tablet #7 and #8 not connecting",
  "description": "Updated description",
  "assignedTo": "user-uuid"
}
```

### PUT /issues/{id}/status
Update issue status.

**Request:**
```json
{
  "status": "in_progress"
}
```

### PUT /issues/{id}/escalate
Escalate issue severity.

**Request:**
```json
{
  "newSeverity": "CRITICAL",
  "reason": "Affecting multiple tablets, game impact risk"
}
```

**Response (200):**
```json
{
  "id": "issue-uuid",
  "severity": "CRITICAL",
  "status": "escalated",
  "escalationHistory": [
    {
      "previousSeverity": "HIGH",
      "newSeverity": "CRITICAL",
      "reason": "Affecting multiple tablets, game impact risk",
      "escalatedBy": "user-uuid",
      "timestamp": "2024-09-05T15:30:00Z"
    }
  ]
}
```

### PUT /issues/{id}/resolve
Resolve issue.

**Request:**
```json
{
  "resolution": "Replaced faulty network cable. All tablets now connected.",
  "evidence": ["evidence-uuid-1"]
}
```

**Response (200):**
```json
{
  "id": "issue-uuid",
  "status": "resolved",
  "resolution": {
    "summary": "Replaced faulty network cable. All tablets now connected.",
    "evidence": ["evidence-uuid-1"],
    "resolvedBy": "user-uuid",
    "timestamp": "2024-09-05T16:00:00Z"
  }
}
```

---

## Assignments

### GET /assignments
List assignments.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| gameId | uuid | Filter by game |
| userId | uuid | Filter by user |
| systemId | string | Filter by system |
| status | string | PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT |

**Response (200):**
```json
[
  {
    "id": "assignment-uuid",
    "gameId": "game-uuid",
    "user": {
      "id": "user-uuid",
      "name": "John Smith",
      "role": "GDA"
    },
    "systemId": "EFC",
    "status": "CONFIRMED",
    "checkInTime": null,
    "checkOutTime": null,
    "createdAt": "2024-09-01T00:00:00Z"
  }
]
```

### POST /assignments
Create assignment.

**Request:**
```json
{
  "gameId": "game-uuid",
  "userId": "user-uuid",
  "systemId": "EFC"
}
```

**Response (201):** Assignment object

**Errors:**
- `409`: User already assigned to this game/system
- `400`: User not certified for system

### PUT /assignments/{id}
Update assignment status.

**Request:**
```json
{
  "status": "CONFIRMED"
}
```

### PUT /assignments/{id}/check-in
Record check-in.

**Response (200):**
```json
{
  "id": "assignment-uuid",
  "status": "CHECKED_IN",
  "checkInTime": "2024-09-05T13:00:00Z"
}
```

### PUT /assignments/{id}/check-out
Record check-out.

**Response (200):**
```json
{
  "id": "assignment-uuid",
  "status": "CHECKED_OUT",
  "checkOutTime": "2024-09-05T23:00:00Z"
}
```

---

## Evidence

### GET /evidence
List evidence.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| taskId | uuid | Filter by task |
| issueId | uuid | Filter by issue |
| uploadedBy | uuid | Filter by uploader |

**Response (200):**
```json
[
  {
    "id": "evidence-uuid",
    "taskId": "task-uuid",
    "type": "photo",
    "filename": "tablet-connected.jpg",
    "s3Key": "evidence/2024/09/05/uuid.jpg",
    "url": "https://s3.../presigned-url",
    "uploadedBy": {
      "id": "user-uuid",
      "name": "John Smith"
    },
    "createdAt": "2024-09-05T14:25:00Z"
  }
]
```

### POST /evidence/presign
Get presigned URL for upload.

**Request:**
```json
{
  "filename": "tablet-connected.jpg",
  "contentType": "image/jpeg",
  "taskId": "task-uuid"
}
```

**Response (200):**
```json
{
  "uploadUrl": "https://s3.amazonaws.com/bucket/key?X-Amz-Signature=...",
  "key": "evidence/2024/09/05/uuid.jpg",
  "expiresIn": 300
}
```

### POST /evidence
Confirm upload and create record.

**Request:**
```json
{
  "key": "evidence/2024/09/05/uuid.jpg",
  "filename": "tablet-connected.jpg",
  "taskId": "task-uuid",
  "type": "photo"
}
```

**Response (201):**
```json
{
  "id": "evidence-uuid",
  "taskId": "task-uuid",
  "type": "photo",
  "filename": "tablet-connected.jpg",
  "s3Key": "evidence/2024/09/05/uuid.jpg",
  "createdAt": "2024-09-05T14:25:00Z"
}
```

### GET /evidence/{id}
Get evidence with presigned download URL.

**Response (200):**
```json
{
  "id": "evidence-uuid",
  "url": "https://s3.../presigned-download-url",
  "expiresIn": 3600
}
```

---

## Users

### GET /users
List users.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| role | string | Filter by role |
| certification | string | Filter by certification |
| active | boolean | Filter by active status |

**Response (200):**
```json
[
  {
    "id": "user-uuid",
    "email": "john.smith@nfl.com",
    "name": "John Smith",
    "role": "GDA",
    "certifications": [
      {
        "systemId": "EFC",
        "certifiedAt": "2024-01-15T00:00:00Z",
        "expiresAt": "2025-01-15T00:00:00Z"
      }
    ],
    "active": true,
    "createdAt": "2023-01-01T00:00:00Z"
  }
]
```

### GET /users/{id}
Get user by ID.

### GET /users/recertification-alerts
Get users with expiring certifications.

**Response (200):**
```json
[
  {
    "userId": "user-uuid",
    "userName": "John Smith",
    "certification": "EFC",
    "expiresAt": "2024-10-15T00:00:00Z",
    "daysRemaining": 30
  }
]
```

---

## Venues

### GET /venues
List venues.

**Response (200):**
```json
[
  {
    "id": "venue-uuid",
    "code": "BAL",
    "name": "M&T Bank Stadium",
    "city": "Baltimore",
    "state": "MD",
    "timezone": "America/New_York",
    "capacity": 71008,
    "readiness": 92,
    "certificationStatus": "active",
    "lastGameDate": "2024-09-01T00:00:00Z"
  }
]
```

### GET /venues/{id}
Get venue by ID.

### GET /venues/{id}/checklist
Get venue readiness checklist.

**Response (200):**
```json
[
  {
    "id": "checklist-item-uuid",
    "category": "NETWORK",
    "item": "Primary fiber connection verified",
    "status": "pass",
    "verifiedBy": "user-uuid",
    "verifiedAt": "2024-09-01T10:00:00Z"
  }
]
```

### PUT /venues/{id}/checklist/{itemId}
Update checklist item status.

---

## Notifications

### GET /notifications
Get user notifications.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| unreadOnly | boolean | Only return unread |
| limit | number | Max results (default 50) |

**Response (200):**
```json
[
  {
    "id": "notification-uuid",
    "userId": "user-uuid",
    "type": "ISSUE_CREATED_CRITICAL",
    "priority": "CRITICAL",
    "title": "Critical Issue Reported",
    "body": "EFC: Tablet #7 not connecting",
    "gameId": "game-uuid",
    "read": false,
    "actionUrl": "/game/game-uuid/issues/issue-uuid",
    "createdAt": "2024-09-05T15:00:00Z"
  }
]
```

### PUT /notifications/{id}/read
Mark notification as read.

### PUT /notifications/read-all
Mark all notifications as read.

---

## WebSocket Events

### Connection
```javascript
const socket = io('wss://api.nflit360.nfl.com', {
  auth: { token: accessToken }
});
```

### Subscribe to Game
```javascript
socket.emit('subscribe:game', gameId);
```

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `task:completed` | `{ taskId, playbookId, systemId, completedBy }` | Task completed |
| `task:blocked` | `{ taskId, playbookId, blockedBy, reason }` | Task blocked |
| `issue:created` | `{ issue }` | New issue reported |
| `issue:escalated` | `{ issueId, newSeverity, reason }` | Issue escalated |
| `issue:resolved` | `{ issueId, resolution }` | Issue resolved |
| `lockState:changed` | `{ playbookId, oldState, newState }` | Lock state changed |
| `milestone:passed` | `{ gameId, milestone, readiness }` | Milestone threshold met |
| `milestone:breach` | `{ gameId, milestone, readiness }` | Milestone not met at deadline |
| `readiness:updated` | `{ gameId, readiness }` | Readiness percentage changed |
| `assignment:checkin` | `{ assignmentId, userId }` | GDA checked in |
| `override:requested` | `{ overrideId, playbookId, requestedBy }` | Override requested |
| `override:approved` | `{ overrideId, approvedBy }` | Override approved |
| `override:denied` | `{ overrideId, deniedBy, reason }` | Override denied |

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      {
        "field": "severity",
        "message": "Must be one of: LOW, MEDIUM, HIGH, CRITICAL"
      }
    ]
  }
}
```

### Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid request data |
| 400 | INVALID_STATE_TRANSITION | Invalid lock state change |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 403 | FORBIDDEN | Insufficient permissions |
| 403 | PLAYBOOK_LOCKED | Playbook locked, override required |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource conflict (e.g., duplicate) |
| 423 | LOCKED | Resource is locked |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

---

## Rate Limits

| Endpoint Pattern | Limit | Window |
|-----------------|-------|--------|
| POST /auth/* | 10 | 1 minute |
| GET /* | 100 | 1 minute |
| POST/PUT/DELETE /* | 30 | 1 minute |
| POST /evidence/presign | 20 | 1 minute |

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |
| sortBy | string | createdAt | Sort field |
| sortOrder | string | desc | asc or desc |

**Response Headers:**
```
X-Total-Count: 150
X-Page: 1
X-Limit: 20
X-Total-Pages: 8
```
