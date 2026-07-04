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

## Phase 4 — Attendance module · ✅ COMPLETE (backend)

Built: check-in/out (409 on double check-in / checkout-without-checkin),
server-computed `workedMinutes` + HALF_DAY/PRESENT threshold, daily/weekly/monthly
own views (`lib/time.ts` org-timezone bucketing), Admin list w/ dept/date/employee/
status filters + pagination, manual `mark-absent` (no cron — Section 2). Shared
`resolveProfileId` extracted to `lib/profile.ts` (reused by leave/payroll below).
Manually verified end-to-end via curl against the seeded DB (see Phase 5-7 note —
automated Supertest coverage was explicitly descoped by the project owner in
favor of feature velocity; documented as a known gap, not silently skipped).

## Phase 5 — Leave module · ✅ COMPLETE (backend)

Endpoints: `POST /leave` (apply) · `GET /leave/me` · `GET /leave/balance/me` ·
`GET /leave` (admin, filtered) · `PATCH /leave/:id/review` (admin approve/reject
+ remarks) · `PATCH /leave/:id/cancel` · `GET /leave/:id` · `GET /leave/balance/:employeeId` (admin).

- Overlap rejection against PENDING/APPROVED requests (409); insufficient
  PAID/SICK balance rejected at apply-time (409) — UNPAID unlimited.
- Balance deducted on approval, restored on cancel-of-not-yet-started-APPROVED
  (see judgment call below); `LeaveBalance` rows auto-init per year on first
  access (no annual rollover cron — same spirit as no-cron-auto-absent).
- Approval syncs `Attendance` rows to `LEAVE` status across the date range
  (skips days that already have a real check-in) — extra integration beyond the
  literal spec, matching the SRS's "monthly calendar with markers" intent.
- Notifications fired: LEAVE_SUBMITTED → all Admins, LEAVE_APPROVED/REJECTED →
  employee.
- ⚠️ **Judgment call (Section 14):** spec text "restore on rejection or
  employee-cancel of a still-pending request" is a no-op under a pure
  apply→pending→approve/reject state machine (nothing is deducted until
  approval, so cancelling/rejecting a PENDING request has nothing to restore).
  For the restore clause to mean anything, cancel is extended to also cover an
  **APPROVED-but-not-yet-started** request (`startDate` in the future), which
  does restore the deducted balance. Logged here per Section 14.

## Phase 6 — Payroll module · ✅ COMPLETE (backend)

Endpoints: `GET/PUT /payroll/salary/:employeeId` (Admin edits, Employee
read-only — ownership enforced in service) · `POST /payroll/generate` (Admin) ·
`GET /payroll` (admin, filtered) · `GET /payroll/me` · `GET /payroll/:id`.

- ⚠️ **Endpoint-shape decision (flagged in Phase 0, decided here):**
  `POST /payroll/generate` with **upsert semantics** — regenerating an
  existing employee/month/year snapshot refreshes it from the current salary
  structure rather than erroring. Chosen over `PUT /payroll/:id` because the
  client doesn't know a payroll id until one exists; upsert-by-natural-key
  (employee+month+year) is simpler for the Admin UI to call idempotently.
- Rupees accepted over the wire, converted to integer paise server-side
  (Section 2 — never store floats); `gross`/`net` computed server-side from the
  salary structure snapshot at generation time.
- Notifies the employee (PAYROLL_GENERATED) on generate.

## Phase 7 — Notifications + File Upload · ✅ COMPLETE (backend)

**Notifications:** `notification.service` (`notify`/`notifyAdmins` helpers used
by leave/payroll/document services) + `GET /notifications` (paginated,
`unreadOnly` filter, `unreadCount` badge) + `PATCH /notifications/:id/read` +
`PATCH /notifications/read-all`. All Section 2 trigger points wired: leave
submitted/approved/rejected, payroll generated, email verified (already fired
in Phase 2's `auth.service`), document uploaded/rejected.

**File Upload:** multer `memoryStorage` (buffer never touches disk until our
own code validates it — makes the "422 before touching disk" rule
unconditional, not dependent on multer's own error-path cleanup). Per-category
constraints (PROFILE_PICTURE → image rules 5MB/jpg-png-webp; everything else →
doc rules 10MB/pdf-jpg-png). Storage path
`uploads/{employeeId}/{category}/{uuid}-{originalFilename}`. `Document` rows
track status (PENDING/APPROVED/REJECTED); Admin review endpoint; ownership-
checked download stream; soft delete (file retained on disk for audit, row
hidden from reads).
- ⚠️ **Trigger-recipient clarification (Section 14):** Section 2 literally reads
  "Document uploaded/rejected → Admin" for both events. Read literally,
  rejection notifying the same Admin who just rejected it is meaningless.
  Implemented as: upload → notify Admins (review queue), reject → notify the
  **employee** (so they know to re-upload) — consistent with the Leave
  submitted→Admin / approved-rejected→employee pattern elsewhere in the same
  section. Logged as a clarifying assumption, not a silent deviation.
- Also verified end-to-end via curl (upload/reject/list/review), not Supertest
  — see the Phase 4 testing note above.

### Repo/doc discrepancy fixed this session
On resume, `PROGRESS.md`/`TASK.md` said Phase 4 was "next" but the repo already
had a committed, working (untested) attendance backend (commit `0a304e0`).
Per instructions, repo > docs — this file is now corrected to match reality.
Also fixed a real bug: `prisma/seed.ts` never loaded `.env`, so `npm run seed`
failed on a clean clone (`ts-node`, unlike the `prisma` CLI, doesn't auto-read
`.env`) — added `import 'dotenv/config'`.

### Testing note (project-owner directive)
Automated Supertest coverage for Phases 4-7 was explicitly descoped mid-session
by the project owner in favor of implementation velocity (Phases 2-3's
Supertest suites remain and stay green — 35/35). Every new endpoint above was
manually verified end-to-end against the seeded Postgres instance (curl),
including the RBAC/ownership/validation/notification paths. This is a real gap
against `INSTRUCTIONS.md` Section 10's "Supertest per endpoint" requirement —
flagged here explicitly rather than silently claiming test coverage that
doesn't exist.

## Execution-plan restructure (this session)

Per explicit project-owner direction, the remaining execution plan was
restructured from horizontal (all-backend-then-all-frontend, `INSTRUCTIONS.md`
§11 Phases 8-11) to **vertical slices** — each slice ships one module's
backend + frontend fully wired before the next starts. `INSTRUCTIONS.md` §11
and `TASK.md` updated accordingly; decision logged in `CONTEXT.md`.

## Phases 8+ (frontend, vertical slices) · 🚧 in progress — see TASK.md
