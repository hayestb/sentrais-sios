# NFLIT 360 Web Application - Version Registry

## Current Production Version
**v5.0.2** - Build Fixes & Type Safety Release

---

## Version History

### v5.0.2 (December 12, 2025)
**Focus:** Build Fixes & Type Safety

#### Changes from v5.0.1
This release fixes all 79+ TypeScript compilation errors and ensures a clean production build.

**Common Components Fixes:**
- Added `outline` variant to `ButtonVariant` type
- Added `size` prop to `Badge` component (`sm` | `md` | `lg`)
- Updated `Select` to support both `options` array and `children` pattern
- Removed duplicate export blocks (components already exported inline)
- Exported component prop interfaces for type checking

**Dashboard Components Fixes:**
- Added `trend` prop to `ReadinessGaugeProps`
- Added `subtitle` prop to `StatsCardProps`
- Updated `StatsCardProps.trend` to accept both string and object format
- Added convenience callback props to `QuickActionsProps` (`onReportIssue`, `onViewTasks`, `onViewSystems`)
- Removed duplicate export blocks

**Tasks Components Fixes:**
- Added `showFilters` prop to `TaskListProps`
- Changed `onTaskClick` to accept `Task` object instead of `string`
- Fixed button styling in `EvidenceUploader` (removed invalid `as` prop)
- Removed duplicate export blocks

**Pages Components Fixes:**
- Fixed `TasksPage` callback signatures to match `TaskDetail` expectations
- Updated handlers to use `selectedTask.id` directly

**Hooks Fixes:**
- Removed duplicate export blocks
- All hooks now properly exported with `export function`

**Services Fixes:**
- Fixed `OfflineService.getPendingEvidence()` to not use boolean as IndexedDB key
- Changed from `getAllFromIndex` with boolean to `getAll` with filter

**Type System:**
- All component prop interfaces now exported
- Consistent type safety across all modules
- Clean compilation with no errors

#### Build Output
```
dist/index.html                   0.59 kB │ gzip:  0.36 kB
dist/assets/index-CIdTBI57.css   32.75 kB │ gzip:  5.98 kB
dist/assets/index-D7KqHbmK.js   254.79 kB │ gzip: 72.02 kB
```

---

### v5.0.1 (December 12, 2025)
**Focus:** Initial Complete Build Attempt

#### Issues Found (79 errors)
- Duplicate exports in multiple component files
- Missing prop types (`size` on Badge, `outline` variant on Button)
- Incompatible callback signatures between components and pages
- IndexedDB boolean key usage in OfflineService
- Component prop mismatches

---

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

#### Architecture - Service Layer
- **ApiService.ts**: Singleton HTTP client with interceptors, retry logic
- **WebSocketService.ts**: Socket.io with auto-reconnect, typed events
- **OfflineService.ts**: IndexedDB schema, sync queue, conflict resolution

#### Architecture - Zustand Stores
- **authStore.ts**: User state, demo accounts, token persistence
- **gameStore.ts**: Game/task/issue management, readiness calculation
- **uiStore.ts**: Theme, modals, toasts, filters

#### Architecture - Custom Hooks
- `useApi()` / `useMutation()` - Data fetching
- `useWebSocket()` / `useWebSocketEvent()` - Real-time
- `useOfflineStatus()` - Offline detection with `pendingSyncCount`
- `useGameClock()` - Countdown timer with `display` property
- `useReadinessCalculator()` - Readiness scoring

#### Component Library
```
components/
├── common/         # Button, Input, Modal, Badge, Toast, etc.
├── dashboard/      # ReadinessGauge, SystemHealthGrid, GameCard
├── tasks/          # TaskList, TaskCard, TaskDetail, EvidenceUploader
├── incidents/      # IssueList, IssueCard, ReportIssueModal
├── systems/        # SystemGrid, SystemCard, SystemDetail
└── pages/          # LoginPage, DashboardPage, TasksPage, etc.
```

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

---

## File Structure (v5.0.2)
```
nflit360-v5.0.2/
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
    │   ├── types/
    │   │   └── index.ts
    │   ├── components/
    │   │   ├── common/index.tsx
    │   │   ├── dashboard/index.tsx
    │   │   ├── tasks/index.tsx
    │   │   ├── incidents/index.tsx
    │   │   ├── systems/index.tsx
    │   │   └── pages/index.tsx
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── index.css
    │   └── vite-env.d.ts
    ├── dist/               # Production build output
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.ts
    ├── tsconfig.json
    └── tsconfig.node.json
```

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
```

---

## Migration from v5.0.1

No breaking changes. Simply rebuild to get type-safe compilation.

```bash
cd web
npm install
npm run build
```

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
