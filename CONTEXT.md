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
