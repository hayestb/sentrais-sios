# Sentrais SIOS

**Strategic Intelligence & Operational System** — a Next.js 15 platform powering Sentrais' internal workflow orchestration, calendar sync, team RBAC, and AI-assisted operations.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Auth | Clerk |
| Database | PostgreSQL via Drizzle ORM |
| UI | Radix UI + Tailwind CSS v4 |
| AI | Anthropic Claude (via `@ai-sdk/anthropic`) |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js ≥ 20
- PostgreSQL 15+
- A [Clerk](https://clerk.com) application
- (Optional) Docker + Docker Compose for local DB

### Local setup

```bash
# 1. Install dependencies
npm install

# 2. Install git hooks
./scripts/setup-hooks.sh

# 3. Copy env template and fill in values
cp .env.example .env.local

# 4. Push DB schema
npm run db:push

# 5. Start dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Docker Compose (database only)

```bash
docker compose up -d db
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:push` | Push schema (dev) |
| `npm run db:studio` | Open Drizzle Studio |

## Environment Variables

See `.env.example` for all required variables. Key groups:

- `NEXT_PUBLIC_CLERK_*` / `CLERK_SECRET_KEY` — Clerk auth
- `DATABASE_URL` — PostgreSQL connection string
- `ENCRYPTION_KEY` — 32-byte hex key for OAuth token encryption

## Deployment

The project deploys to Vercel on every push to `main`. See `vercel.json` for framework and build configuration. Database migrations should be run as part of the release pipeline before traffic is shifted.

## Contributing

1. Branch from `main` using the `claude/<slug>` convention.
2. Run `./scripts/setup-hooks.sh` once after cloning to install the pre-commit lint check.
3. Open a draft PR; CI must pass before requesting review.
