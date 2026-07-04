# HRMS — Human Resource Management System

Production-grade HRMS: auth, employee profiles, attendance, leave, payroll,
notifications, file upload. Next.js 15 frontend + Express/Prisma/PostgreSQL backend.

> **Status:** Phase 0 (scaffolding). This README is filled out fully in Phase 11.
> Build proceeds phase by phase — see `TASK.md` / `PROGRESS.md`.

## Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind, shadcn/ui,
  TanStack Query v5, React Hook Form, Zod, Axios.
- **Backend:** Node 20 LTS, Express, TypeScript, Prisma, PostgreSQL 16.
- **Auth:** JWT access + rotating opaque refresh tokens, bcrypt, helmet, CORS, rate limits.
- **Email:** Nodemailer → maildev (local SMTP catcher) in dev.
- **Docs:** OpenAPI 3.0 at `/api/docs`.

## Quick start (dev)

```bash
# 1. copy env templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. bring up the stack (postgres + maildev + backend + frontend)
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend health: http://localhost:4000/health
- API docs: http://localhost:4000/api/docs (Phase 11)
- maildev inbox: http://localhost:1080

Seed credentials (demo Admin + Employee) documented here in Phase 11.

## Local (without Docker)

```bash
# backend
cd backend && npm install && npm run dev      # http://localhost:4000

# frontend
cd frontend && npm install && npm run dev     # http://localhost:3000
```

Backend needs a reachable Postgres + SMTP — easiest is `docker compose up postgres maildev`.

## Repo layout

```
backend/    Express + Prisma API (MVC)
frontend/   Next.js app
prisma/     schema.prisma, migrations, seed.ts
AGENTS.md   operating rules for the build
CONTEXT.md  architecture decision log
TASK.md     current phase checklist
PROGRESS.md done / pending / assumptions
```
