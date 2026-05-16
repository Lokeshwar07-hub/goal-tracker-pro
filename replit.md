# AtomQuest Goal Setting & Tracking Portal

Enterprise HRMS-style goal management portal with full approval workflows, quarterly tracking, analytics, and role-based access for employees, managers, and admins.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/atomquest run dev` — run the React frontend (port from $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — build composite lib declarations (run before api-server typecheck)
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite, wouter (routing), TanStack Query, Recharts, shadcn/ui, Tailwind CSS
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT (jsonwebtoken) + bcryptjs, 3 roles: employee / manager / admin
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — Drizzle ORM table definitions (users, goals, shared_goals, quarters, notifications, audit_logs, departments, escalations)
- `lib/api-spec/openapi.yaml` — OpenAPI 3.0 spec (source of truth for all API contracts)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod validation schemas
- `artifacts/api-server/src/routes/` — Express route handlers (auth, users, goals, shared_goals, quarters, notifications, audit_logs, analytics, admin)
- `artifacts/api-server/src/middlewares/auth.ts` — JWT requireAuth + requireRole middleware
- `artifacts/api-server/src/lib/` — audit logging and notification helpers
- `artifacts/atomquest/src/pages/` — all frontend pages
- `artifacts/atomquest/src/context/AuthContext.tsx` — JWT auth context with localStorage persistence

## Architecture decisions

- Contract-first API: OpenAPI spec drives both Zod validation (server) and React Query hooks (client) via codegen
- JWT stored in localStorage (not cookies) — injected via `setAuthTokenGetter` from `@workspace/api-client-react`
- Role-based access enforced at route level via `requireRole()` middleware; employees see only own goals, managers see team goals
- Progress score computed server-side: supports numeric, percentage, timeline, and zero_based unit-of-measurement types
- Audit log and notification creation are non-critical (errors swallowed) to prevent business logic failures

## Product

- **Employee view**: Create/edit/submit goals, track quarterly progress, view notifications, self-service settings
- **Manager view**: Approve/reject/return team goals with comments, inline target/weightage overrides, team analytics
- **Admin view**: Full user management, department and quarter cycle management, org-wide analytics, CSV export, audit logs, escalations

## Demo Credentials (all password: `password123`)

| Role | Email |
|------|-------|
| Employee | sarah.johnson@atomquest.com |
| Manager | raj.patel@atomquest.com |
| Admin | admin@atomquest.com |

## User preferences

- JWT-based auth (not Replit Auth / Clerk)
- Demo accounts pre-seeded with realistic goal data for Q2 2026

## Gotchas

- After editing DB schema, run `pnpm run typecheck:libs` BEFORE `pnpm --filter @workspace/api-server run typecheck` (the server depends on lib declarations)
- `/api/users/my-team` route must be registered before `/:id` in Express router — already handled in users.ts
- The `CreateDepartmentBody` Zod schema name (not `CreateDepartment`)
- `deadline` and `startDate`/`endDate` fields come as `Date` objects from Zod coerce — convert to `.toISOString()` when writing to DB text columns

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
