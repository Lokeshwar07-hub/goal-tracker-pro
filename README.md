# AtomQuest Goal Tracker Pro

Enterprise goal management portal (React + Vite frontend, Express API, SQLite database).

## Prerequisites

- **Node.js** 20+
- **pnpm** 10+ (`npm install -g pnpm`)

No Docker, no PostgreSQL, no database server required for local development.

## Quick start (Windows)

Run from the project root in PowerShell:

```powershell
pnpm install
pnpm run dev
```

That command will:

1. Create `data/atomquest.db` (local SQLite file)
2. Apply the schema and seed demo users
3. Start the API (port 8080) and frontend (port 18913)

Open **http://localhost:18913** and sign in:

| Role     | Email                         | Password      |
| -------- | ----------------------------- | ------------- |
| Admin    | admin@atomquest.com           | password123   |
| Manager  | raj.patel@atomquest.com       | password123   |
| Employee | sarah.johnson@atomquest.com   | password123   |

## Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `pnpm run dev`    | Setup DB + start API and frontend        |
| `pnpm run dev:web`| Frontend only                            |
| `pnpm run dev:api`| API only (runs `db:setup` not included)  |
| `pnpm run db:setup` | Create/update DB + seed demo users   |
| `pnpm run db:check` | Verify database file is accessible |
| `pnpm run build`  | Typecheck + production builds            |

## How the database works

- **Local:** SQLite file at `data/atomquest.db` (created automatically).
- **Production (Vercel):** Use [Turso](https://turso.tech) (free libSQL hosting compatible with this schema).

Optional `.env` (copy from `.env.example`):

- `JWT_SECRET` — token signing (recommended even locally)
- `DATABASE_URL` — path **relative to project root** (default: `data/atomquest.db`). The app creates the file and folder automatically.

## Deploy to Vercel

1. Push to GitHub.
2. Import the repo in Vercel.
3. Set environment variables:

   | Variable              | Value                          |
   | --------------------- | ------------------------------ |
   | `DATABASE_URL`        | `libsql://…` from Turso        |
   | `DATABASE_AUTH_TOKEN` | Turso auth token               |
   | `JWT_SECRET`          | long random string             |
   | `NODE_ENV`            | `production`                   |

4. Deploy. Then seed production once from your machine:

   ```powershell
   $env:DATABASE_URL="libsql://your-db.turso.io"
   $env:DATABASE_AUTH_TOKEN="your-token"
   pnpm run db:setup
   ```

`vercel.json` in the repo configures the frontend build and `/api` serverless route.

## Push to GitHub

```powershell
git add .
git commit -m "Use SQLite for zero-config local development"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

## Troubleshooting

- **Login failed** — Run `pnpm run db:setup`, then `pnpm run dev`.
- **Cannot reach API** — Use `pnpm run dev` (starts both servers), not only the web app.
- **unable to open database file** — Run from the project root (not `lib/db`). Delete the `data` folder and run `pnpm run db:setup` again.
- **Stale database** — Delete the `data` folder and run `pnpm run db:setup` again.

See [replit.md](./replit.md) for architecture notes from the original export.
