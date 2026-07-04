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

## Phase 2 — Auth module + tests · ✅ COMPLETE

### DoD — met
- ✅ All 7 auth endpoints work end-to-end
- ✅ Real email delivery to maildev (tests fetch + parse tokens from the inbox)
- ✅ Supertest suite green — **18 tests**, happy + auth-fail + validation-fail per endpoint

### Endpoints
`POST /auth/register` · `/verify-email` · `/resend-verification` · `/login` ·
`/refresh` · `/logout` · `/forgot-password` · `/reset-password`

### Built
- ✅ Services: `auth.service` (register/verify/resend/login/refresh/logout/forgot/reset),
     `token.service` (JWT + rotating opaque refresh + family theft-detection),
     `email.service` (Nodemailer → maildev)
- ✅ Libs: `prisma` singleton, `password` (bcrypt 12), `crypto` (opaque token + sha256),
     `asyncHandler`
- ✅ Middleware: `authenticate`, `authorize(role)`, `validate` (Zod), `rateLimit`
     (Section 2 limits, skipped in test)
- ✅ Validators: `auth.validators` (Zod, to be mirrored on frontend)
- ✅ Controller + routes wired into `app.ts`; refresh cookie httpOnly/strict/path=/auth
- ✅ Test helpers: `test/db` (purge), `test/maildev` (inbox read + token extract)
- ✅ Typecheck clean, eslint clean (no stray console), maildev healthcheck fixed

### Verified behaviours
Register→verify→login gate · access/refresh rotation · **reuse→family revoke** ·
logout revoke · reset invalidates refresh tokens + changes password · enumeration-safe
forgot/login.

### Assumptions/decisions logged in CONTEXT.md
- ⚠️ Verify/reset tokens hashed on `User` (no separate table)
- ⚠️ `resend-verification` 429s on cooldown for known-unverified users (minor enum leak)
- ⚠️ Refresh cookie `secure` only in production (dev is http://localhost)

## Phase 3 — Employee profile + RBAC · ✅ COMPLETE

### DoD — met
- ✅ Field-level edit restrictions enforced **server-side** and tested (not UI-hidden):
     Employee editing an Admin-only field → 403, change not applied (asserted in DB)

### Endpoints
`GET /employees` (admin, paginated/search/filter) · `GET /employees/me` ·
`GET /employees/:id` (ownership) · `POST /employees` (admin) ·
`PATCH /employees/:id` (field-level RBAC) · `DELETE /employees/:id` (admin, soft)

### Built
- ✅ `employee.service` (list/getById/getMine/create/update/softDelete) w/ ownership +
     field-level RBAC + stored-XSS escaping
- ✅ `employee.validators` (create/update/list schemas + self vs admin field sets)
- ✅ `validators/common` (pagination + safe orderBy) — reusable across all list endpoints
- ✅ `lib/sanitize` (HTML escape for free-text)
- ✅ controller + routes wired; `authenticate` + `authenticatedLimiter` on all
- ✅ **17 new Supertest tests** (35 total green), typecheck + eslint clean

### Assumptions/decisions logged in CONTEXT.md
- ⚠️ Admin-created employees: pre-verified + emailed a reset link to set their password
- ⚠️ Employee sending an Admin-only field → 403 (explicit reject, not silent strip)
- ⚠️ Soft delete revokes refresh tokens + soft-deletes User too

## Phase 4 — Attendance module · ⬜ next

## Phases 5–11 · ⬜ not started
