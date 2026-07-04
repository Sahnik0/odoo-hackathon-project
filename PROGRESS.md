# PROGRESS.md — Build Progress & Assumptions

## Legend
✅ done · 🚧 in progress · ⬜ pending · ⚠️ assumption/limitation logged

---

## Phase 0 — Scaffolding · ✅ COMPLETE

### DoD — met
- ✅ Backend boots empty — `npm run dev` → `/health` returns `200` with success envelope
- ✅ Frontend boots — `next build` compiles clean (Next 15.5, React 19, Tailwind v4)
- ✅ `docker compose up postgres maildev` → Postgres **healthy**, maildev UI `200` on :1080

### Done
- ✅ Read `INSTRUCTIONS.md` + `DESIGN.md`
- ✅ Scaffold files created: `AGENTS.md`, `CONTEXT.md`, `TASK.md`, `PROGRESS.md`
- ✅ Root config: `.gitignore`, `.editorconfig`, `docker-compose.yml`, README stub
- ✅ Backend: package.json (pinned stack), tsconfig, eslint+prettier, jest, `.env.example`,
     Dockerfile, MVC folder structure, Express boot skeleton, pino logging, typed
     `ApiError`, centralized error handler, success-envelope helpers, `/health` + tests
- ✅ Prisma: schema stub (datasource+generator), seed stub, `prisma generate` works
- ✅ Frontend: Next 15 App Router + Tailwind v4 scaffold, `.env.example`, Dockerfile
     (standalone), placeholder page
- ✅ Verified: backend typecheck clean, jest green (2/2), backend boots + serves `/health`,
     frontend production build succeeds

### Notes
- Backend `npm audit`: 4 high (from `multer@1.x`, the LTS line the brief pins) — tracked,
  revisit in Phase 7 (file upload). Frontend: 2 moderate, dev-only.

### Assumptions & limitations (Section 14)
- ⚠️ **Node 20 vs 22**: local machine is Node 22; Docker images pin Node 20 LTS per
  Section 3. Backward-compatible; not a behavioral deviation.
- ⚠️ **No cron auto-absent** (Section 2): Admin marks absences manually. Documented,
  in scope by design — implemented in Phase 4.
- ⚠️ **Leave duration** counts inclusive calendar days, no weekend/holiday exclusion
  (Section 2 simplification) — implemented in Phase 5.

### Later-phase decisions flagged (not yet made)
- Payroll generation endpoint shape → decide Phase 6.
- Design-system extraction from `DESIGN.md` → Phase 8 gate.

---

## Phase 1 — Prisma schema, migrations, seed · ✅ COMPLETE

### DoD — met
- ✅ `prisma migrate dev --name init` runs clean against compose Postgres
- ✅ Seed produces 1 admin + **6** employees with realistic data across ALL entities
- ✅ Seed idempotent (clean-then-seed; re-run holds at 7 users)

### Built
- ✅ Full `schema.prisma`: 10 spec entities + `LoginIdCounter` support table; 7 enums
     (5 spec + `DocumentStatus`, `NotificationType`); UUID PKs, timestamps, soft-delete
     on User/EmployeeProfile/LeaveRequest/Document; indexes on FKs + `Attendance.date`,
     `LeaveRequest.status`, `EmployeeProfile.department` (+ more)
- ✅ Migration `20260704051645_init` applied + committed
- ✅ `backend/src/lib/loginId.ts` — shared, txn-safe login-ID generator (reused Phase 2)
- ✅ `prisma/seed.ts` — comprehensive, idempotent; login IDs verified
     (`OIPRSH20220001`, per-year serials correct)
- ✅ Backend typecheck clean, jest 2/2 green

### Row counts after seed
users 7 · profiles 7 · attendance 15 · leaveRequests 3 · leaveBalances 21 ·
salaryStructures 7 · payrolls 5 · documents 2 · notifications 4

### Assumptions/decisions logged in CONTEXT.md
- ⚠️ Money = Int paise (ceiling ₹21.4M/field; BigInt if ever exceeded)
- ⚠️ `LoginIdCounter` table added (concurrency-safe serial) — not in Section 5 list
- ⚠️ `DocumentStatus` + `NotificationType` enums added (needed for module triggers)
- ⚠️ Verify/reset tokens stored hashed on `User` (no separate table)

## Phase 2 — Auth module + tests · ⬜ next

## Phases 3–11 · ⬜ not started
