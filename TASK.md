# TASK.md — Current Phase Checklist

## Phase 0 — Scaffolding

**DoD:** Both frontend and backend boot empty; `docker-compose up` brings up
Postgres + maildev cleanly.

### Scaffold files (pre-Phase-0, Section 12)
- [x] `AGENTS.md` — operating rules copied from brief
- [x] `CONTEXT.md` — ready for decisions, Phase 0 entry written
- [x] `TASK.md` — this file
- [x] `PROGRESS.md` — ready

### Repo root
- [ ] `.gitignore` (node, env, build artifacts, uploads)
- [ ] `README.md` (stub — filled fully in Phase 11)
- [ ] `docker-compose.yml` — postgres + maildev + backend + frontend, healthchecks
- [ ] `.editorconfig`

### Backend (`backend/`)
- [ ] `package.json` — deps + scripts (dev/build/start/lint/test)
- [ ] `tsconfig.json`
- [ ] `.eslintrc` + `.prettierrc`
- [ ] `.env.example` (documented vars)
- [ ] `Dockerfile`
- [ ] `src/` folder structure (config, controllers, middleware, routes, services,
      validators, types, lib, uploads)
- [ ] Minimal Express app that boots + `/health` endpoint returns 200
- [ ] Structured logging (pino) wired
- [ ] Centralized error handler + API envelope helpers stub

### Prisma (`prisma/`)
- [ ] Folder created (`schema.prisma` filled in Phase 1)

### Frontend (`frontend/`)
- [ ] Next.js 15 App Router scaffold (TS, Tailwind)
- [ ] `.env.example` (documented vars)
- [ ] `Dockerfile`
- [ ] Boots to a placeholder page

### Verify
- [ ] `docker compose up` → postgres healthy + maildev UI reachable
- [ ] Backend boots, `/health` 200
- [ ] Frontend boots, placeholder renders
- [ ] Update `PROGRESS.md`, commit, state DoD met
