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
| 1.0.0 | 2025-12-10 | Initial release with full platform |

---

## Migration Notes

### Upgrading from Pre-release

If you were using a pre-release version:

1. **Database Migration**: Run the DynamoDB table migration script
   ```bash
   npm run migrate:dynamodb
   ```

2. **Secret Rotation**: Regenerate all API keys via Secrets Manager
   ```bash
   aws secretsmanager rotate-secret --secret-id nflit360/prod/api-keys
   ```

3. **iOS App**: Delete and reinstall to clear cached credentials

4. **Environment Variables**: Update `.env` files with new variables
   - Added: `ANTHROPIC_MODEL_PRIMARY`, `ANTHROPIC_MODEL_COMPLEX`
   - Changed: `API_KEY` → stored in Secrets Manager

---

## Deprecation Notices

None in this release.

---

## Known Issues

1. **iOS Offline Mode**: Currently not implemented. Tasks cannot be completed without network connectivity.

2. **WebSocket Reconnection**: Dashboard may require manual refresh if connection drops during long sessions.

3. **Large Playbook Loading**: Playbooks with 100+ tasks may experience slight delay on initial load.

---

## Support

For issues or questions:
- **Documentation**: [docs.nflit360.sentrais.com](https://docs.nflit360.sentrais.com)
- **Email**: support@novatelabs.io
- **Emergency**: PagerDuty on-call rotation

---

[Unreleased]: https://github.com/sentrais/nflit-ios-360/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/sentrais/nflit-ios-360/releases/tag/v1.0.0
