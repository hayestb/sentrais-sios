# NFLIT 360 Web Application - Version Registry

## Current Production Version
**v5.0.0** - Complete Modular Architecture

---

## Version History

### v5.0.0 (December 12, 2025)
**Focus:** Production-Ready Modular Architecture

#### Breaking Changes from v4.x
| Area | v4.x | v5.0 |
|------|------|------|
| File Structure | Single App.tsx (~3000 lines) | 40+ modular components |
| State Management | React Context only | Context + Zustand stores |
| API Layer | Inline fetch calls | ApiService singleton with interceptors |
| WebSocket | Mock implementation | Full Socket.io with reconnection |
| Offline Storage | localStorage | IndexedDB with conflict resolution |
| Routing | Simple hash routing | Full hash router with guards |

#### New Architecture - Service Layer

**ApiService.ts** (HTTP Client)
- Singleton pattern with configuration
- Request/response/error interceptors
- Automatic token refresh with queue management
- Retry logic with exponential backoff (3 attempts)
- File upload with progress tracking
- Request queue for offline operations

**WebSocketService.ts** (Real-time)
- Socket.io integration with auto-reconnect
- Heartbeat/ping-pong monitoring (30s interval)
- Channel subscriptions per game/system/position
- 11 typed event types
- Presence system for online user tracking

**OfflineService.ts** (Persistence)
- IndexedDB schema with 6 stores
- Conflict resolution (local/remote/merge strategies)
- Sync queue with priority processing
- Evidence storage with blob support
- Cache management with TTL

#### New Architecture - Zustand Stores

**authStore.ts**
- User state with role/permissions/preferences
- Demo accounts: exec@, lead@, tech@nflit360.dev
- Token persistence to localStorage
- WebSocket token synchronization

**gameStore.ts**
- Game management with milestone tracking (M1-M6)
- Task CRUD with completion/override
- Issue CRUD with escalation
- Real-time readiness calculation
- WebSocket event handlers
- Demo data generators

**uiStore.ts**
- Theme: darkMode, sidebarCollapsed, compactView
- Modal management with typed data
- Toast notifications with auto-dismiss
- Notification system with persistence
- Filter state for tasks/issues

#### New Architecture - Custom Hooks

**API Hooks**
- `useApi(url)` - Generic data fetching with cache
- `useMutation(url)` - POST/PUT/DELETE with invalidation

**WebSocket Hooks**
- `useWebSocket()` - Connection state management
- `useWebSocketEvent(event)` - Typed event subscription
- `useGameChannel(gameId)` - Auto join/leave channels

**Offline Hooks**
- `useOfflineStatus()` - Online/offline detection, sync trigger

**Utility Hooks**
- `useGameClock(kickoffTime)` - Real-time countdown
- `useEvidenceCapture()` - Camera integration
- `useNotificationPermission()` - Browser notification API
- `useReadinessCalculator()` - Position/system scoring

#### New Components

**Common Library** (`/components/common/`)
- Button (6 variants, 3 sizes, loading state)
- Input (with icons, validation)
- Select (dropdown)
- Card (with hover effect)
- Modal (5 sizes)
- Badge (6 variants)
- Toast (4 types)
- Progress (with readiness colors)
- Spinner, Avatar, Skeleton, EmptyState, Divider

**Dashboard Components** (`/components/dashboard/`)
- ReadinessGauge (SVG circular gauge)
- SystemHealthGrid (compact system cards)
- MilestoneTracker (M1-M6 progress)
- GameCard (game info with readiness)
- QuickActions (action buttons)
- StatsCard, TeamMemberCard, CriticalIssuesPanel

**Task Components** (`/components/tasks/`)
- TaskCard (compact and expanded)
- TaskList (with filters)
- TaskDetail (modal with evidence)
- EvidenceUploader (camera/file)
- TaskProgressSummary

**Incident Components** (`/components/incidents/`)
- IssueCard (severity-colored)
- IssueList (with filters)
- IssueDetail (modal with actions)
- ReportIssueModal (full form)
- EscalationBanner
- IssueStatsSummary

**System Components** (`/components/systems/`)
- SystemCard (with health metrics)
- SystemGrid (sortable by status)
- SystemDetail (modal with tabs)
- SystemHealthSummary
- DependencyMap

**Page Components** (`/components/pages/`)
- LoginPage (with demo accounts)
- DashboardPage (role-based)
- TasksPage (task management)
- IncidentsPage (issue management)
- SystemsPage (system monitoring)
- SettingsPage (user preferences)
- AppShell (layout with sidebar)

#### Readiness Calculation Algorithm (Unchanged)

```
Position Score = TaskScore - IssuePenalty + TimeFactor

TaskScore = (Σ CompletedWeight / Σ TotalWeight) × 70
IssuePenalty = (Critical × 15) + (High × 5)
TimeFactor = f(TimeToGame, TaskCompletion)

Priority Weights: Critical=4, High=3, Medium=2, Low=1

Time Pressure Matrix:
< 2h + critical incomplete: -20
< 2h + no critical: -5
2-6h + critical incomplete: -10
6-24h + critical incomplete: -5
> 24h + 80%+ complete: +10

System Readiness = Σ(Position Score × Weight) / Σ(Weights)
Where Weight = 2 for primary owner, 1 for secondary
```

#### File Structure
```
nflit360-v5.0/
└── web/
    ├── src/
    │   ├── services/
    │   │   ├── ApiService.ts
    │   │   ├── WebSocketService.ts
    │   │   └── OfflineService.ts
    │   ├── stores/
    │   │   ├── authStore.ts
    │   │   ├── gameStore.ts
    │   │   └── uiStore.ts
    │   ├── hooks/
    │   │   └── index.ts
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── index.tsx
    │   │   ├── dashboard/
    │   │   │   └── index.tsx
    │   │   ├── tasks/
    │   │   │   └── index.tsx
    │   │   ├── incidents/
    │   │   │   └── index.tsx
    │   │   ├── systems/
    │   │   │   └── index.tsx
    │   │   └── pages/
    │   │       └── index.tsx
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.ts
    ├── tsconfig.json
    └── tsconfig.node.json
```

#### Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "zustand": "^4.5.0",
  "socket.io-client": "^4.7.4",
  "idb": "^8.0.0",
  "lucide-react": "^0.312.0",
  "clsx": "^2.1.0",
  "date-fns": "^3.3.0"
}
```

#### Migration Guide v4.x → v5.0

1. **Install new dependencies:**
   ```bash
   npm install zustand idb socket.io-client clsx date-fns
   ```

2. **Update imports:**
   ```typescript
   // Before (v4.x)
   import { useAuth } from './contexts/AuthContext';
   
   // After (v5.0)
   import { useAuthStore, selectUser } from './stores/authStore';
   ```

3. **Configure services in App.tsx:**
   ```typescript
   ApiService.getInstance().configure({ baseUrl: API_URL });
   await OfflineService.getInstance().initialize();
   ```

4. **Replace inline fetch with ApiService:**
   ```typescript
   // Before
   const res = await fetch('/api/tasks');
   
   // After
   const tasks = await ApiService.getInstance().get('/tasks');
   ```

5. **Use hooks for real-time:**
   ```typescript
   const { connectionState } = useWebSocket();
   useWebSocketEvent('task.completed', handleTaskCompleted);
   ```

---

### v4.0.0 (December 12, 2025)
**Focus:** EVERGAME360 GDA Real-Time Readiness Integration

#### Features
- Complete web application (React/TypeScript PWA)
- iOS mobile app (SwiftUI)
- EVERGAME360 GDA readiness system integration
- Multi-location support (Venue → Position → System)
- Offline-first architecture with IndexedDB queue
- Role-based dashboards (Exec, NFL Lead, GDA)

---

### v3.0.0 (December 12, 2025)
**Focus:** Full NFL Lead Experience

#### Features
- Team Dashboard with technician management
- Task assignment and reassignment
- Approvals queue with evidence review
- Escalation management (P1/P2)
- Milestone sign-off system

---

### v2.0.0 (December 12, 2025)
**Focus:** Login Bug Fix

---

### v1.0.0 (December 12, 2025)
**Focus:** Initial Release

---

## Demo Accounts

| Role | Email | Description |
|------|-------|-------------|
| Executive | exec@nflit360.dev | Strategic oversight |
| NFL Lead | lead@nflit360.dev | Game management |
| GDA Tech | tech@nflit360.dev | Field operations |

*Any password works in demo mode*

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3.4 |
| State | Zustand 4.5 |
| Real-time | Socket.io Client 4.7 |
| Offline | IndexedDB (idb 8.0) |
| Icons | Lucide React |
| PWA | Vite PWA Plugin |

---

## Next Versions Roadmap

### v5.1.0 (Planned)
- Role-specific dashboard optimizations
- Enhanced offline sync with conflict UI
- Push notification integration
- Performance monitoring integration

### v5.2.0 (Planned)
- Multi-venue view for executives
- Cross-venue issue correlation
- Historical analytics dashboard
- Export reports to PDF

### v6.0.0 (Planned)
- Native iOS app with SwiftUI
- Native Android app with Kotlin
- Shared business logic via TypeScript
- Biometric authentication
