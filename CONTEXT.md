# CONTEXT.md — Architecture Decision Log

Append-only. Each entry: what was decided, and why. Newest phase at the bottom.

---

## Phase 0 — Scaffolding

**Monorepo layout.** Single repo, two deployables: `backend/` (Express + Prisma)
and `frontend/` (Next.js). `prisma/` lives at repo root per Section 4 folder spec,
consumed by the backend. Root holds `docker-compose.yml`, scaffold files, README.
Rationale: Section 4 pins this structure; frontend/backend are separate deployables
so Zod schemas are mirrored manually, not shared across the network boundary.

**Node version.** Local dev machine runs Node 22, but Docker images pin `node:20`
(Section 3 says Node 20 LTS). Pinning the image keeps CI/prod reproducible;
local 22 is backward-compatible for dev. Logged as an environment note, not a
deviation.

**Package manager.** npm (present at 9.2). No pnpm/yarn — avoid adding tooling the
brief doesn't require.

**TypeScript everywhere.** Backend and frontend both TS per Section 3. Backend uses
`ts-node-dev` for dev reload; compiled with `tsc` for the Docker production image.

**Docker services.** `postgres:16`, `maildev` (dev SMTP catcher), `backend`,
`frontend`. Each with a healthcheck. Backend `depends_on` postgres healthcheck
before running migrations (Section 10). maildev chosen over Mailtrap — no paid
dependency, runs fully local (Section 3).

**Env strategy.** `.env.example` committed for both apps with a one-line comment per
var (Section 10). Real `.env` gitignored. Compose injects service-to-service values
(DB host = `postgres`, SMTP host = `maildev`).

**Lint/format.** ESLint + Prettier both apps. `no-console` enforced in backend
committed code (Section 10 — structured logging via `pino`/`morgan` instead).

**Decisions deferred to their phases (flagged now so they aren't silently made):**
- Payroll generation endpoint shape (`POST /payroll/generate` vs upsert semantics) —
  decided in Phase 6, logged here then.
- Design-system token extraction from `DESIGN.md` — done at the Phase 8 gate, not now.

---

## Phase 1 — Prisma schema, migrations, seed

**Money as integer paise (Int).** All money fields (`SalaryStructure`, `Payroll`)
are `Int` paise — no floats (Section 2). Ceiling is ₹21,474,836 per field (int4),
ample for monthly figures. If per-field amounts ever need to exceed that, migrate to
`BigInt` (adds JSON-serialization handling). Ceiling noted in the schema header.

**Login-ID generation → `LoginIdCounter` table.** Added a small support table
(`year` PK, `seq`) not in Section 5's entity list. Serial is incremented inside the
same transaction that creates the profile (`nextLoginId()` in
`backend/src/lib/loginId.ts`), so concurrent registrations can't collide on a serial.
Alternative (counting existing rows per year) races under concurrency — rejected.
The generator lib is shared: seed uses it now, Phase 2 registration reuses it.

**Two enums added beyond Section 5** (same justification as Section 2 adding
`LeaveBalance` — needed for the module to function, logged not silently assumed):
- `DocumentStatus` (PENDING/APPROVED/REJECTED) — supports the "document
  uploaded/rejected → notify Admin" trigger (Section 2 notifications).
- `NotificationType` — typed notification triggers (the Section 2 trigger list).

**Verification/reset tokens stored on `User`, not a separate table.** Hashed
`emailVerifyTokenHash` / `passwordResetTokenHash` + expiries + `emailVerifyLastSentAt`
(resend cooldown) live as nullable columns on `User`. Single-use enforced by clearing
after use. Avoids an extra table for at-most-one-live-token-per-user-per-purpose.

**RefreshToken rotation columns.** `familyId` (rotation family), `replacedByTokenHash`
(rotation chain), `revokedAt`, `rememberMe`, `expiresAt`, optional `userAgent`/`ip`.
Token itself stored only as `tokenHash` (unique). Reuse-detection (revoke family) is
implemented in Phase 2.

**Dates.** `@db.Date` for calendar-day columns (`Attendance.date`,
`LeaveRequest.start/endDate`, `LeaveBalance` is year-int). Full `DateTime` (UTC) for
`checkIn`/`checkOut` and all audit timestamps. Display TZ handled at the edge (Phase 4).

**Seed run mechanics.** `seed.ts` lives at repo-root `prisma/` (Section 4) but deps
are in `backend/node_modules`, and the auto-generated Prisma client resolves from
there too. Seed script runs from `backend/` with `NODE_PATH=node_modules` +
`-O '{module:CommonJS,moduleResolution:Node}'` so Node/ts-node resolve correctly from
the out-of-tree file. Prisma's auto-install artifact at repo root
(`/package.json`, `/package-lock.json`) is gitignored — never imported.

**Seed contents.** 1 Admin (`admin@hrms.local` / `Admin@123`) + 6 Employees
(`<name>@hrms.local` / `Employee@123`), covering every entity: profiles w/ generated
login IDs, leave balances (all 3 types × current year), salary structures, a week of
attendance (PRESENT/HALF_DAY/ABSENT), leave requests (approved+deducted / pending /
rejected), June payroll for active employees, documents, notifications. Employment
statuses include ACTIVE / ON_LEAVE / TERMINATED. Clean-then-seed = idempotent.

---

## Phase 2 — Auth module

**Layering.** `routes → middleware (rateLimit, validate) → controller (thin: cookies +
envelope) → service (business logic) → lib (prisma, password, crypto, token)`.
Controllers never format errors or touch business rules; services throw typed
`ApiError`; the centralized handler formats responses (Section 7).

**Access vs refresh (Section 2).** Access = JWT (`sub`, `role`, `email`), 15m, sent
as `Authorization: Bearer`. Refresh = opaque 256-bit random (NOT JWT), sha256-hashed
at rest, delivered as an httpOnly/sameSite=strict cookie scoped to `path=/auth`.
`secure` is on only in production (dev is http://localhost). Cookie name `refreshToken`.

**Rotation + theft detection.** Each refresh call rotates: old token marked
`revokedAt` + `replacedByTokenHash`, new token issued in the same `familyId`.
Presenting an already-revoked token ⇒ reuse ⇒ the entire family is revoked
(`token.service.rotateRefreshToken`). Verified by test (replay old → 401, then the
valid successor → 401).

**Token storage.** Only hashes stored. Email-verify + password-reset tokens are
hashed columns on `User` (single-use; cleared after use). Reset invalidates all
refresh tokens (`revokeAllRefreshTokens`). Resend has a 60s cooldown via
`emailVerifyLastSentAt`.

**Enumeration resistance.** `login` returns a generic 401 for both unknown email and
wrong password; `forgot-password` and `resend-verification` return generic 200 for
unknown/verified accounts (resend still 429s on cooldown for a known unverified user —
accepted trade-off, logged).

**Registration.** Always EMPLOYEE (Section 2). Reuses `nextLoginId()` from Phase 1;
creates User+profile+login ID+leave balances in one transaction, then emails the
verification link. `dateOfJoining = now`, join year drives login ID + balance year.

**Rate limiting.** `express-rate-limit`: login 5/min, register 3/min, forgot 3/15min,
plus a 100/min per-user `authenticatedLimiter` for later protected routes. Breaches
funnel through the error envelope (429). **Skipped when `NODE_ENV=test`** so the
integration suite isn't throttled.

**Testing strategy.** Supertest against the in-process app (no port bind). A dedicated
`authtest_` email prefix + `purgeUsers()` isolates tests from seed data and each other.
Real emails are asserted + parsed for tokens via the maildev REST API (`src/test/maildev.ts`).
18 tests: happy + auth-fail + validation-fail per endpoint, plus rotation/theft/reset.

**Docker healthcheck fix.** maildev binds IPv4 `0.0.0.0:1080` only; the healthcheck's
`localhost` resolved to IPv6 `::1` and reported unhealthy. Switched maildev + backend
healthchecks to `127.0.0.1`.

**Async errors.** Express 4 doesn't catch rejected async handlers → all controllers
wrapped in `asyncHandler` so rejections reach the centralized error handler.

---

## Phase 3 — Employee profile + RBAC

**Field-level RBAC (Section 8) enforced in the service, not the route.** A single
`updateEmployeeSchema` (all-optional) validates shape; `employee.service.update` then
splits fields by role: Employee may set only `phone`/`address`/`profilePicture`, and
any Admin-only field (`firstName`, `lastName`, `department`, `designation`,
`dateOfJoining`, `employmentStatus`) present in an Employee's request → **403** (not
silently stripped — explicit, testable, and the DoD demands proof it's blocked
server-side). Field sets live in `employee.validators` (`SELF_EDITABLE_FIELDS` /
`ADMIN_ONLY_FIELDS`) so frontend can mirror them.

**Ownership vs role (Section 6).** `assertCanAccess` gates read/update: Admin bypasses,
Employee restricted to `profile.userId === requester.id`. Route-level `authorize('ADMIN')`
guards list/create/delete; per-record ownership is service-level for get/update.

**Route ordering.** `GET /employees/me` declared before `GET /employees/:id` so "me"
isn't captured as an id param.

**Admin-created accounts (decision — Section 14).** `POST /employees` creates a
pre-verified EMPLOYEE (admin vouches for the address) with an unusable random password,
then emails a password-**reset** link so the employee sets their own password. Reuses
the existing reset flow rather than adding an invite mechanism. Logged as the default.

**Soft delete (Section 5).** `DELETE` soft-deletes the profile AND the user
(`deletedAt`), and revokes active refresh tokens so the account can't authenticate.
Never hard-deletes. All reads filter `deletedAt: null`.

**Stored-XSS (Section 6).** Free-text (`address`, `phone`) escaped via
`lib/sanitize.escapeHtml` on write, in addition to Zod. Verified by test
(`<script>` → `&lt;script&gt;`).

**Shared list querying.** `validators/common.ts` — `paginationSchema` (page/pageSize
≤100/sort/search) + `buildOrderBy` (allowlisted sort fields, safe fallback). Reused by
every future list endpoint. `search` on employees spans name/loginId/email
(case-insensitive). `meta` via `buildPageMeta`.

---

## Phase 4 — Attendance module

**`lib/profile.ts` — shared `resolveProfileId(userId)`.** Extracted the
"resolve caller's EmployeeProfile id" helper out of attendance.service so
leave.service and payroll.service (Phase 5-6) reuse it instead of duplicating.

**One row per employee per day via upsert, not create+check.** `checkIn`
upserts on the `(employeeProfileId, date)` unique key; an existing row with a
null `checkIn` (e.g. an Admin-marked ABSENT day) is overridable to PRESENT by
a genuine check-in — the unique constraint is the day-slot, not "already has a
row." Second check-in with a non-null `checkIn` → 409.

**Half-day threshold.** `env.HALF_DAY_THRESHOLD_HOURS` (default 4) compared
against server-computed `workedMinutes`; below → HALF_DAY, at/above → PRESENT.

**View ranges are pure UTC arithmetic** (`lib/time.ts viewRange`) computed off
the org-timezone calendar date, not runtime-tz-dependent — avoids drift between
server TZ and `ORG_TIMEZONE` config.

---

## Phase 5 — Leave module

**LeaveBalance auto-init per year, no rollover cron.** Balance rows are only
seeded for an employee's join year (Phase 1 seed / employee.service.create).
`leave.service.getOrInitBalance` lazily creates a year's row on first access
with the admin-configurable defaults (`env.LEAVE_DEFAULT_PAID/SICK`, UNPAID
unlimited) instead of 404ing — same "no cron, handle it at the edge" pattern
as attendance's no-auto-absent rule.

**Cancel extended to not-yet-started APPROVED leave (Section 14 judgment
call).** The literal spec ("apply/view/cancel own") plus Section 2's "restore
balance on rejection or employee-cancel of a still-pending request" is
internally inconsistent under a strict pending→approved state machine:
nothing is deducted until approval, so cancelling a PENDING request has
nothing to restore. For the restore clause to have a real effect, `cancel` is
allowed on PENDING (any time) **and** APPROVED-with-a-future-startDate (this
does restore the deducted balance + removes the LEAVE attendance markers it
added). Cancelling an already-started/completed APPROVED leave is rejected
(409) — logged here, not silently assumed, per Section 14.

**Approval syncs Attendance → LEAVE.** Beyond the literal Section 8 leave
spec, but directly serves the original SRS's "monthly calendar with
Present/Absent markers" intent (3.5.1). Implemented as an upsert per date in
the approved range that **only creates** a row where none exists — never
overwrites a real check-in/mark-absent record already on the books. Reversed
symmetrically on cancel-of-approved (delete only pure LEAVE rows with no
`checkIn`).

**Overlap + balance checks happen at apply-time**, not review-time — rejecting
an invalid request immediately (409) rather than accepting it and failing
review is better UX and avoids balance math having to handle the review-time
same edge cases twice.

---

## Phase 6 — Payroll module

**Endpoint shape decided (flagged in Phase 0):** `POST /payroll/generate` with
**upsert semantics** on the natural key `(employeeProfileId, month, year)`.
Rejected `PUT /payroll/:id` — the Admin UI doesn't have a payroll id to PUT to
until one exists for that employee/month, so upsert-by-natural-key is simpler
to call idempotently ("generate July payroll for Priya" is naturally
idempotent — re-running it just refreshes the snapshot from the current
salary structure, which is desirable if the structure changed after an early
generate).

**Salary structure is one-to-one per employee** (matches the Prisma schema's
`@unique` FK) — there's no history of past structures, only the current one +
the frozen snapshot baked into each generated `Payroll` row at generation
time. Changing salary structure never retroactively changes past payroll.

**Employee read-only enforced in the service**, not just by omitting a PATCH
route on the frontend — `GET /payroll/salary/:employeeId` and `GET
/payroll/:id` both run through `assertCanAccess` (Admin bypasses, Employee
restricted to own `userId`), and the mutating routes (`PUT .../salary/:id`,
`POST /payroll/generate`) are `authorize('ADMIN')`-gated at the router level.

---

## Phase 7 — Notifications + File Upload

**`notification.service` — `notify` / `notifyAdmins` helpers, no envelope
formatting.** Plain Prisma writes; callers (leave/payroll/document services)
fire these after their own transaction commits, not inside it — a
notification failure must never roll back the business action that
triggered it. (Contrast with `auth.service.verifyEmail`'s EMAIL_VERIFIED
notification, which *is* inside the transaction since it's part of the same
atomic state change, not a downstream side-effect.)

**Document/reject notification recipient — clarified (Section 14).** Section
2 literally lists "Document uploaded/rejected → Admin" for both. Notifying
the *same* Admin who just rejected a document about their own rejection is
meaningless. Implemented as: upload → `notifyAdmins` (populates the review
queue), reject → notify the **employee** (so they know to re-upload) —
consistent with how Leave's submitted→Admin / approved-or-rejected→employee
split works elsewhere in the same section. Logged as a clarifying reading,
not a silent deviation.

**Upload validation happens entirely in application code before any disk
write — `multer.memoryStorage()`, not `diskStorage`.** This makes "reject
with 422 before touching disk" (Section 2) true unconditionally, rather than
depending on multer's own error-path file cleanup. `assertValidUpload` checks
mimetype + size against per-category limits (PROFILE_PICTURE → image rules;
everything else → doc rules) before `document.service.upload` ever calls
`fs.writeFile`. A `MulterError` (e.g. multer's own outer size cap tripping
first) is now mapped to 422 in the centralized error handler rather than
falling through to 500.

**Document soft-delete retains the file on disk.** Only the `Document` row
gets `deletedAt` (Section 5's soft-delete list); the underlying file is kept
for audit/compliance rather than actually unlinked — no spec requirement to
purge it, and irreversibly deleting the bytes on a soft-delete would
contradict the "never hard-delete employee-linked records" principle in
spirit.

---

## Execution-plan restructure — vertical slices (project-owner directive)

Replaced `INSTRUCTIONS.md` §11 / `AGENTS.md`'s horizontal plan (Phases 0-7
all-backend, then 8-11 all-frontend) with vertical slices: every remaining
phase now delivers one module's backend **and** frontend, fully wired
end-to-end, before the next module starts. New order (see `TASK.md` for the
live checklist):

1. Scaffolding + Docker skeleton (done, Phase 0)
2. Prisma schema + migrations + seed (done, Phase 1)
3. Auth (done backend; frontend — register→login→protected routes — next)
4. Employee Profile (BE done; FE next)
5. Attendance (BE done; FE next)
6. Leave (BE done; FE next)
7. Payroll (BE done; FE next)
8. Notifications + File Upload (BE done; FE next)
9. Cross-cutting UI polish across all modules
10. Docs, Docker, README, final QA

Rationale given: horizontal splitting means nothing is demoable/integration-
tested until Phase 8+, and any backend API-shape mistake surfaces late. The
backend for modules 3-8 above was already built horizontally in prior
sessions before this directive arrived — rather than redo that work, it's
being treated as "backend done, frontend pending" within each renumbered
vertical slice, and the *frontend* build order from here on strictly follows
slices 3→8 in order, each ending with real, wired, working pages before the
next starts. The Design System Gate (previously "before Phase 8") is pulled
forward into slice 3, since that's now the first slice touching the frontend.

Also decided here, not deferred further: the OpenAPI/swagger-jsdoc docs
mentioned in Section 3/13 will be authored incrementally per-slice (annotate
each router as it's frontend-wired) rather than as a single Phase-11-only
pass, so `/api/docs` isn't a last-minute scramble.
