# NFLIT360 v8.3.1 - Claude Code Continuation Prompt

## Project Overview
NFLIT360 is an NFL IT operations management platform for orchestrating game day technology coordination across all 32 NFL venues. Built on EVERGAME v7 playbooks.

## Current State (Updated)

### Frontend (v8.3.1 - Complete)
# NFLIT360 v8.3 - Claude Code Continuation Prompt

## Project Overview
NFLIT360 is an NFL IT operations management platform for orchestrating game day technology coordination across all 32 NFL venues.

## Current State (Updated)

### Frontend (v8.3 - In Progress)
- **Location**: `/home/user/NFLIT360`
- **Running**: Vite dev server at http://localhost:5173 (or port 3000)
- **Framework**: React 18 + Zustand + React Router v6
- **Styling**: Custom CSS (dark theme) - see `src/styles/index.css`

### What's Implemented (v8.3.1)
### What's Implemented (v8.3)
1. **API Client Layer** - `src/services/apiClient.js`
   - Unified API client with mock data fallback
   - Retry logic with exponential backoff
   - Offline queue support
   - Role-based API key switching

2. **React Hooks** - `src/hooks/useApi.js`
   - `usePlaybooks`, `usePlaybook` - Playbook data fetching
   - `useUsers`, `useRecertificationAlerts` - User management
   - `useVenues`, `useVenueChecklist` - Venue certification
   - `useGames`, `useGame` - NFL game schedules
   - `useIssues` - Issue tracking with CRUD
   - `useTasks` - Task management
   - `useEvidence` - Evidence upload
   - `useCriticalGates` - Gate status tracking
   - `useApiStatus` - Backend health check
   - `useDashboardData` - Combined dashboard hook

3. **Admin Components** - `src/components/AdminComponents.jsx`
   - `PlaybookListPage` - Playbook grid (view/edit tasks only, no add)
   - `TaskModal` - Task CRUD with milestone/priority/gate linking
   - `UserManagementPage` - User table with certification status + position assignment
   - `VenueManagementPage` - Venue grid with readiness indicators
   - `VenueDetailModal` - Venue overview/checklist/punchlist tabs
   - NIN Phases removed from end-user visibility
   - `PlaybookListPage` - Playbook grid with create/edit modals
   - `PlaybookModal` - Create/edit playbook dialog
   - `TaskModal` - Task CRUD with milestone/priority/gate linking
   - `UserManagementPage` - User table with certification status
   - `VenueManagementPage` - Venue grid with readiness indicators
   - `VenueDetailModal` - Venue overview/checklist/punchlist tabs

4. **NFL Exec Game Cards** - `src/components/GameCards.jsx`
   - `GameCardsGrid` - Responsive game card layout
   - `GameCard` - Single game with readiness metrics
   - `GamesPage` - Full games view with week selector
   - `ExecGamesSummary` - Executive summary widget
   - `WeekSelector` - NFL week navigation

5. **3 End-User Personas** - `src/pages/index.jsx`
   - **NFL Executive** - Game-cards focused visibility (no management)
   - **NFL Lead** - Compliance & operations with task/issue/user management
   - **GDA** - Field operations with system/position self-assignment
   - Admin dashboard reserved for Sentrais team (internal)

6. **GDA Assignment Flow**
   - System assignment (IVRS, C2P, SVS, etc.)
   - Position assignment (Booth, Home Sideline, Away Sideline, Field Level, Tech Ops)
   - Optional game assignment
   - Tasks filtered by assigned system

7. **State Management** - `src/stores/index.js`
5. **5 Persona Dashboards** - `src/pages/index.jsx`
   - Admin, Executive, Lead, FTR, GDA views
   - 32-venue status grid
   - Critical gates panel (18 gates)
   - System health matrix (9 systems)

6. **State Management** - `src/stores/index.js`
   - 9 Zustand stores (auth, games, tasks, issues, etc.)
   - Offline-first with IndexedDB sync

### Backend (Not in this repo)
The handoff doc referenced `~/nflit360-backend/` but this directory doesn't exist in the current environment. The frontend uses **mock data** by default when no backend is available.

## Key Files

```
src/
├── components/
│   ├── AdminComponents.jsx  # Playbook/User/Venue CRUD (v8.3)
│   └── GameCards.jsx        # NFL Exec game cards (v8.3)
├── hooks/
│   └── useApi.js            # All API hooks (v8.3)
├── services/
│   ├── apiClient.js         # API client with mock fallback (v8.3)
│   ├── evidenceService.js   # Photo capture/compression
│   └── offlineService.js    # IndexedDB sync queue
├── stores/
│   └── index.js             # 9 Zustand stores
├── pages/
│   └── index.jsx            # All page components
├── data/
│   ├── playbooks.js         # 16 playbooks, 505 tasks, 18 gates
│   ├── schedule2025.js      # 18-week NFL schedule
│   └── venues.js            # 32 NFL venues
├── router/
│   └── index.jsx            # Route definitions (v8.3)
└── styles/
    └── index.css            # All styles (560+ lines)
```

## Routes Available

| Path | Component | Description |
|------|-----------|-------------|
| `/` | LoginPage | SSO login placeholder |
| `/role-select` | RoleSelectPage | 3 persona selector (Exec/Lead/GDA) |
| `/dashboard/360` | Dashboard360 | Exec game-cards view (visibility only) |
| `/dashboard/lead` | LeadDashboard | Lead compliance & management |
| `/dashboard/gda` | GDADashboard | GDA field ops with assignment |
| `/admin` | AdminDashboard | Sentrais internal admin |
| `/admin/playbooks` | PlaybookListPage | Playbook task management |
| `/admin/users` | UserManagementPage | User/cert management |
| `/admin/venues` | VenueManagementPage | Venue certification |
| `/games` | GamesPage | NFL Exec game cards |
| `/role-select` | RoleSelectPage | 5 persona selector |
| `/dashboard/360` | Dashboard360 | Executive command center |
| `/admin` | AdminDashboard | Admin overview |
| `/admin/playbooks` | PlaybookListPage | Playbook management (v8.3) |
| `/admin/users` | UserManagementPage | User/cert management (v8.3) |
| `/admin/venues` | VenueManagementPage | Venue certification (v8.3) |
| `/games` | GamesPage | NFL Exec game cards (v8.3) |
| `/game/:gameId` | GameDetailPage | Game detail with tasks/gates |
| `/tasks` | TasksPage | Task list view |
| `/issues` | IssuesPage | Issue management |

## Commands to Start

```bash
cd /home/user/NFLIT360
npm install  # if needed
npm run dev
# Open: http://localhost:5173 (or http://localhost:3000)
```

## Environment Variables

Create `.env.local` to configure:
```env
VITE_API_URL=http://localhost:3000
VITE_API_KEY=dev-admin-key
VITE_USE_MOCK=true  # Set to false when backend is available
```

## Remaining Work

### High Priority
1. **Backend Implementation** - Create the API server with DynamoDB
   - Tables: playbooks, users, venues, issues, games, evidence
   - Endpoints per `IMPLEMENTATION_GUIDE_V8.3.md`

2. **S3 Evidence Upload** - Complete presigned URL flow
   - Currently stubbed in `evidenceService.js`

3. **Real Authentication** - Replace SSO placeholder
   - OAuth/JWT integration needed

### Medium Priority
4. **ITIL Workflow UI** - SLA tracking, escalation chains
5. **Gate Dependencies** - Real-time gate validation
6. **Figma Alignment** - Light theme option matching Figma specs

### Lower Priority
7. **Mobile App** - React Native not started
8. **Performance** - Bundle optimization, lazy loading improvements

## Notes
- Mock data enabled by default - works without backend
- Dark theme active - see CSS variables in `index.css`
- All 32 NFL venues and 18 weeks of 2025 schedule loaded
- 505+ tasks across 16 system-specific playbooks
- 18 critical gates with severity/timing/impact data
