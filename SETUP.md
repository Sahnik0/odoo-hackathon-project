# SETUP.md — Run the HRMS locally

Prereqs: **Node 20+**, **Docker** (with Compose), npm.

## 1. Start Postgres + maildev (Docker)

```bash
docker compose up -d postgres maildev
```

- Postgres → `localhost:5432` (user/pass/db: `hrms`/`hrms`/`hrms`)
- maildev inbox UI → http://localhost:1080 (catches all outgoing email — verification links, password resets)

## 2. Backend (Express + Prisma)

```bash
cd backend
npm install
cp .env.example .env          # defaults already point at the Docker Postgres/maildev above
npx prisma migrate deploy --schema=../prisma/schema.prisma   # apply migrations
npm run seed                  # 1 admin + 6 employees, realistic data across every module
npm run dev                   # http://localhost:4000
```

Verify: `curl http://localhost:4000/health` → `{"success":true,...}`.

### Prisma command cheatsheet (run from `backend/`)

| Command | What it does |
|---|---|
| `npx prisma migrate dev --schema=../prisma/schema.prisma --name <name>` | Create + apply a new migration (dev) |
| `npx prisma migrate deploy --schema=../prisma/schema.prisma` | Apply existing migrations (prod-safe, what you run on a fresh clone) |
| `npx prisma generate --schema=../prisma/schema.prisma` | Regenerate the Prisma Client after a schema change |
| `npm run seed` | Clean-then-seed demo data (idempotent — safe to re-run) |
| `npx prisma studio --schema=../prisma/schema.prisma` | Browse the DB in a GUI at http://localhost:5555 |

(The schema lives at repo-root `prisma/`, consumed by `backend/` — see `CONTEXT.md` for why. `npm run` scripts already point `--schema` at it via `package.json`'s `prisma.schema` field, so plain `npx prisma migrate dev` also works from `backend/`.)

## 3. Frontend (Next.js)

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env          # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev                   # http://localhost:3000
```

## 4. Log in

Visit http://localhost:3000 — the landing page has Login/Register buttons, or go straight to `/login`.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@hrms.local` | `Admin@123` |
| Employee | `priya@hrms.local` (or any other seeded employee — see `prisma/seed.ts` for the full list) | `Employee@123` |

## Everything via Docker Compose (alternative)

```bash
docker compose up -d --build
```

Brings up all 4 services (`postgres`, `maildev`, `backend`, `frontend`). The backend container runs migrations on boot (`start:migrate`); seed the DB once via `docker compose exec backend npm run seed` if you want demo data.

## Common issues

- **`DATABASE_URL` errors running the seed manually**: make sure you're in `backend/` (the seed script resolves `../prisma/seed.ts` relative to there) and that `backend/.env` exists.
- **Port already in use**: something else is on 3000/4000/5432/1080/1025 — stop it or change the port in `.env` / `docker-compose.yml`.
- **CORS errors in the browser**: `backend/.env`'s `CORS_ORIGIN` must exactly match the frontend origin (`http://localhost:3000` by default).
