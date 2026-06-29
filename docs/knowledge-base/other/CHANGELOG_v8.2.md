# Changelog

All notable changes to the NFLIT iOS 360 platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Real-time WebSocket updates for dashboard
- Offline mode for iOS app
- Custom report builder
- Integration with NFL GameStats API

---

## [8.2.0] - 2025-12-13

### Fixed

#### FIX-8.2-001: Milestone Progress Calculation
- **Issue**: M3 (Inspections) showing 0% progress at T-3:45 when tasks completed ahead of schedule
- **Solution**: Decoupled progress calculation from milestone activation state
- **Impact**: Progress now always reflects completed/total tasks regardless of milestone timing
- **Files Changed**: `NFLIT360App.swift`, `Models.swift`, `server.ts`

#### FIX-8.2-002: Consolidated Navigation Badge Counts
- **Issue**: Top nav badges duplicated quick action button counts (Approvals, Escalations)
- **Solution**: Removed badge counts from nav tabs; retained on quick action buttons only
- **Impact**: Cleaner navigation, single source of truth for action counts
- **Files Changed**: `NFLIT360App.swift`

#### FIX-8.2-003: Elevated System Status Visibility
- **Issue**: "8/9 - 1 degraded" displayed with equal weight to non-critical metrics
- **Solution**: Conditional styling based on system health state (healthy/degraded/critical)
- **Impact**: Degraded systems now visually prominent with warning colors and pulse animation
- **Files Changed**: `NFLIT360App.swift`, `DesignTokens.swift`

### Added

#### FIX-8.2-004: Team Logo Integration
- **Feature**: Official NFL team logos on all game cards
- **Implementation**: Async image loading with abbreviation fallback
- **Data**: All 32 NFL teams with primary/secondary colors
- **New Components**: 
  - `TeamLogoView` - Async logo loading with shimmer placeholder
  - `TeamAbbreviationBadge` - Fallback for unavailable logos
  - `GameCardView` - Updated game card with logo layout
- **API Changes**: 
  - New `GET /api/v1/teams` endpoint
  - Updated `GET /api/v1/dashboard/overview` with full team data
- **Files Changed**: `NFLIT360App.swift`, `Models.swift`, `APIService.swift`

#### New Components
- `SystemStatusCard` - Health-aware status display with expandable details
- `MilestoneProgressIndicator` - Always-calculating progress with pre-completion support
- `QuickActionsBar` - Consolidated action buttons with embedded counts

#### Design Token Updates
- Added `systemHealthyBackground`, `systemHealthyBorder`
- Added `systemDegradedBackground`, `systemDegradedBorder`
- Added `systemCriticalBackground`, `systemCriticalText`
- Added `alertPulse` animation

### Changed
- `MainNavigationView` - Tabs no longer show badge counts
- Dashboard overview API response includes `healthState` enum
- Milestone progress API always returns calculated value

---

## [8.1.0] - 2025-12-12

### Added
- UI Architecture Synthesis document
- Stakeholder notes consolidation
- Figma design alignment review
- Live test preparation checklist

---

## [8.0.0] - 2025-12-12

### Added
- Season v8 navigation
- NFL Lead dashboard with MetLife Stadium layout
- Quick action buttons (Review Approvals, Handle Escalations, Report Issue)
- Team status grid with active technician tracking
- Current milestone indicator with progress bar

---

## [1.0.0] - 2025-12-10

### Added

#### Platform Infrastructure
- Complete AWS infrastructure via Terraform
  - ECS Fargate for containerized services
  - API Gateway (REST + WebSocket)
  - DynamoDB tables with GSIs
  - S3 buckets with KMS encryption
  - Secrets Manager with 90-day auto-rotation
  - CloudWatch logging and alarms
  - WAF with OWASP rules
- GitHub Actions CI/CD pipeline with 7 stages
- NFL season deployment window enforcement
- Blue/green deployment strategy

#### Backend API (Node.js/TypeScript)
- Fastify-based REST API
- Secret key authentication (`X-API-Key` header)
- Tiered rate limiting (Standard/Professional/Enterprise)
- Role-based access control (RBAC)
- Endpoints:
  - `GET /health` - Service health check
  - `GET /api/v1/dashboard/overview` - Executive dashboard data
  - `GET /api/v1/operations/:venueId/:gameDate` - Venue operations
  - `POST /api/v1/operations/:venueId/:gameDate/tasks` - Task updates
  - `GET /api/v1/playbooks` - List playbooks
  - `GET /api/v1/playbooks/:id` - Playbook details
  - `POST /api/v1/evidence` - Evidence metadata upload
  - `POST /api/v1/ai/query` - Claude.ai queries

#### AI Orchestration (Python/Claude.ai)
- FastAPI service with Anthropic SDK
- Claude Sonnet 4 for operational queries
- Claude Opus 4 for complex analysis
- Natural language querying
- Playbook execution planning
- Incident analysis support
- Report generation
- EVERGAME360 playbook context

#### iOS Application (SwiftUI)
- Swift 5.9 / iOS 17.0+ target
- SwiftUI-based UI with design tokens
- Secure API key storage (Keychain)
- Dashboard with milestone progress
- System health visualization
- Task management interface
- Evidence capture workflow
- Settings with sign-out

#### Design System
- Figma Code Connect integration
- Design tokens (colors, typography, spacing)
- NFL system-specific color palette
- Shadow and animation definitions
- Reusable SwiftUI view modifiers

#### n8n Workflows
- Deployment automation workflow
  - NFL season window enforcement
  - Slack notifications
  - Health check verification
  - PagerDuty alerts on failure
- Game day monitoring workflow
  - 5-minute health polling
  - P1/P2/P3 issue detection
  - Automated alerting

#### Documentation
- OpenAPI 3.1 specification
- Technical blueprint (Word document)
- Master orchestration JSON schema
- Environment configuration template
- Comprehensive README

### Security
- TLS 1.3 enforced on all endpoints
- AES-256 encryption at rest via KMS
- VPC isolation with private subnets
- WAF protection with rate limiting
- Automatic secret rotation (90 days)
- Field-level encryption for PII

### Compliance
- Multi-tenant data isolation
- Audit logging to CloudWatch
- Evidence chain of custody
- RBAC with least privilege

---

## Version History Summary

| Version | Date | Description |
|---------|------|-------------|
| 8.2.0 | 2025-12-13 | UI fixes: milestone progress, nav badges, system status, team logos |
| 8.1.0 | 2025-12-12 | UI Architecture synthesis and Figma alignment |
| 8.0.0 | 2025-12-12 | Season v8 deployment with NFL Lead dashboard |
| 1.0.0 | 2025-12-10 | Initial release with full platform |

---

## Migration Notes

### Upgrading from v8.1 to v8.2

1. **API Updates**: Deploy new `/api/v1/teams` endpoint before iOS update
   ```bash
   npm run deploy:api
   ```

2. **Team Data Seeding**: Populate team logo URLs
   ```bash
   npm run seed:teams
   ```

3. **iOS App Update**: Deploy via TestFlight
   ```bash
   xcodebuild -scheme NFLIT360 -configuration Release archive
   ```

4. **Verify**: Check all 32 team logos load correctly in staging

---

## Known Issues

1. **iOS Offline Mode**: Currently not implemented. Tasks cannot be completed without network connectivity.

2. **WebSocket Reconnection**: Dashboard may require manual refresh if connection drops during long sessions.

3. **Large Playbook Loading**: Playbooks with 100+ tasks may experience slight delay on initial load.

4. **Team Logo CDN**: Some international game team logos may load slower due to CDN propagation.

---

## Support

For issues or questions:
- **Documentation**: [docs.nflit360.sentrais.com](https://docs.nflit360.sentrais.com)
- **Email**: support@novatelabs.io
- **Emergency**: PagerDuty on-call rotation

---

[Unreleased]: https://github.com/sentrais/nflit-ios-360/compare/v8.2.0...HEAD
[8.2.0]: https://github.com/sentrais/nflit-ios-360/compare/v8.1.0...v8.2.0
[8.1.0]: https://github.com/sentrais/nflit-ios-360/compare/v8.0.0...v8.1.0
[8.0.0]: https://github.com/sentrais/nflit-ios-360/compare/v1.0.0...v8.0.0
[1.0.0]: https://github.com/sentrais/nflit-ios-360/releases/tag/v1.0.0
