# NFLIT 360 Web Application v5.0.0

## Production-Ready Modular Architecture

A comprehensive game day operations platform for NFL IT teams, featuring real-time task management, incident tracking, and system health monitoring across all 32 venues.

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Accounts

| Role | Email | Description |
|------|-------|-------------|
| Executive | exec@nflit360.dev | Strategic oversight, all venues |
| NFL Lead | lead@nflit360.dev | Game management, team oversight |
| GDA Tech | tech@nflit360.dev | Field operations, task execution |

*Any password works in demo mode*

---

## Architecture Overview

### Service Layer (`/src/services/`)

| Service | Purpose |
|---------|---------|
| **ApiService** | HTTP client with interceptors, token refresh, retry logic |
| **WebSocketService** | Real-time Socket.io with auto-reconnect, channels |
| **OfflineService** | IndexedDB storage, sync queue, conflict resolution |

### State Management (`/src/stores/`)

| Store | Purpose |
|-------|---------|
| **authStore** | User authentication, roles, preferences |
| **gameStore** | Games, tasks, issues, readiness calculations |
| **uiStore** | Theme, modals, toasts, filters |

### Custom Hooks (`/src/hooks/`)

- `useApi()` / `useMutation()` - Data fetching
- `useWebSocket()` / `useWebSocketEvent()` - Real-time
- `useOfflineStatus()` - Offline detection
- `useGameClock()` - Countdown timer
- `useReadinessCalculator()` - Readiness scoring

### Components (`/src/components/`)

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

## Key Features

### Real-Time Readiness System

The platform calculates readiness scores at three levels:

1. **Position Level** - Individual GDA location
2. **System Level** - Technology system (WiFi, Network, etc.)
3. **Game Level** - Overall venue readiness

**Formula:**
```
Position Score = TaskScore - IssuePenalty + TimeFactor

TaskScore = (Completed Weight / Total Weight) × 70
IssuePenalty = (Critical × 15) + (High × 5)
TimeFactor = f(TimeToGame, TaskCompletion)
```

### Offline-First Architecture

- All data cached in IndexedDB
- Operations queued when offline
- Automatic sync on reconnection
- Conflict resolution strategies

### Role-Based Dashboards

- **Executive**: Multi-venue overview, critical issues, trends
- **NFL Lead**: Team management, approvals, escalations
- **GDA Tech**: Task execution, evidence capture, issue reporting

---

## Project Structure

```
nflit360-v5.0/
├── web/
│   ├── src/
│   │   ├── services/        # API, WebSocket, Offline
│   │   ├── stores/          # Zustand state stores
│   │   ├── hooks/           # Custom React hooks
│   │   ├── components/      # UI components
│   │   ├── App.tsx          # Main app with routing
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Tailwind styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
└── NFLIT360_Web_Version_Registry_v5.md
```

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run test         # Run tests
```

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3.4 |
| State | Zustand 4.5 |
| Real-time | Socket.io Client |
| Storage | IndexedDB (idb) |
| Icons | Lucide React |
| PWA | Vite PWA Plugin |

---

## Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
```

---

## Deployment

### Build for Production

```bash
npm run build
```

Output in `dist/` directory.

### Deploy to Vercel

```bash
npx vercel --prod
```

---

## Migration from v4.x

See [Version Registry](./NFLIT360_Web_Version_Registry_v5.md) for detailed migration guide.

Key changes:
1. Install new dependencies: `zustand`, `idb`, `socket.io-client`
2. Update imports from Context to Zustand stores
3. Configure ApiService with baseUrl
4. Replace inline fetch with ApiService methods
5. Use new hooks for WebSocket and offline

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## License

MIT License - See LICENSE file for details.

---

## Support

- **Documentation**: [docs.nflit360.dev](https://docs.nflit360.dev)
- **Issues**: GitHub Issues
- **Slack**: #nflit360-dev

---

**Built with ❤️ for NFL Game Day Excellence**

*Part of the Sentrais Operational Orchestration Platform*
