# CLAUDE.md — Sentrais SIOS

Guidance for Claude Code sessions working in this repository.

## Project identity

Next.js 15 App Router application. TypeScript throughout. No Pages Router, no `getServerSideProps`. All routes live under `src/app/`.

## Commands

```bash
npm run dev        # dev server (Turbopack)
npm run build      # production build — run before pushing to verify
npm run lint       # ESLint — must pass before commit
npm run db:push    # sync Drizzle schema to local DB (dev only)
npm run db:migrate # run migrations (production-safe)
```

## Architecture notes

- **Auth**: Clerk middleware in `src/middleware.ts`. Route protection is declarative via `clerkMiddleware`. Never bypass with hardcoded user IDs.
- **Database**: Drizzle ORM. Schema files are in `src/db/schema/`. Always use `db:generate` + `db:migrate` for production schema changes; use `db:push` only locally.
- **RBAC**: Role definitions live in `src/lib/rbac.ts`. Admin routes are under `src/app/(admin)/`. Do not add role checks inline — use the shared helpers.
- **AI**: Anthropic SDK via `@ai-sdk/anthropic`. Streaming responses use the Vercel AI SDK `streamText` helper. Keep API keys server-side only.
- **Calendar sync**: Google and Outlook OAuth tokens are stored encrypted (`ENCRYPTION_KEY`). Token refresh logic is in `src/lib/calendar/`.

## File conventions

- `src/app/(auth)/` — public auth routes (sign-in, sign-up)
- `src/app/(dashboard)/` — authenticated app shell
- `src/app/(admin)/` — admin-only routes
- `src/app/api/` — API route handlers
- `src/components/ui/` — shared Radix/shadcn primitives (do not modify without a focused PR)
- `src/lib/` — shared utilities, no React imports

## Environment

Copy `.env.example` → `.env.local` and fill in all values before running locally. Never commit `.env.local` or any file containing real secrets.

## Before pushing

1. `npm run lint` — zero warnings
2. `npm run build` — must succeed
3. Confirm no `.env` or credential files staged (`git diff --cached --name-only`)

## Git hooks

Run `./scripts/setup-hooks.sh` once after cloning to install the pre-commit hook that enforces the lint check.
