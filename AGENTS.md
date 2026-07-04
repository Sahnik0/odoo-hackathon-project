# AGENTS.md — Operating Rules for the HRMS Build

This file is the standing operating contract for any agent working on this repo.
It is copied from `INSTRUCTIONS.md` (the source of truth). If this file and
`INSTRUCTIONS.md` ever disagree, `INSTRUCTIONS.md` wins — update this file.

## Prime Directives

1. **`INSTRUCTIONS.md` is the sole source of truth** for behavior, data model,
   API contract, business rules, phases, and Definition of Done.
2. **`DESIGN.md` is UI look only** — aesthetic inspiration (color, type, spacing,
   component styling). Never adopt its functionality, copy, page structure, or
   branding. On conflict: behavior → `INSTRUCTIONS.md`, look → `DESIGN.md`.
3. **Work phase by phase** (Section 11). Do not start a phase until the previous
   phase's DoD is met and committed. No generating the whole system in one pass.
4. **Maintain state across sessions** via the four scaffold files below. Read all
   four before writing any code in a fresh session.

## Scaffold Files (keep current)

- `AGENTS.md` — this file. Operating rules.
- `CONTEXT.md` — architecture decisions + why. Append-only log.
- `TASK.md` — current phase's checklist. Check items off as done.
- `PROGRESS.md` — done / pending / assumptions (Section 14) and why.

After every phase: append decisions to `CONTEXT.md`, rewrite `TASK.md` for the
next phase, update `PROGRESS.md`, commit, and state which DoD items are met.

## Conflict Resolution (highest first)

1. `INSTRUCTIONS.md` explicit specs (Sections 2, 5–9)
2. Original SRS intent (features, roles, modules)
3. Wireframes / `DESIGN.md` — visual only, never authoritative for behavior
4. Own judgment — only when nothing above covers it, and only after logging the
   assumption in `PROGRESS.md`.

Decisions changing data-model shape, security, or role permissions are **never**
silently assumed — flag in `PROGRESS.md`, apply the Section 2 default if one exists.

## Non-Negotiable Defaults (Section 2 — memorize)

**Accounts & roles**
- Self-registration always creates `EMPLOYEE`. No self-service path to ADMIN.
  Admin accounts created only by an existing Admin (authenticated admin-only
  endpoint) or the seed script (first bootstrap).
- Login ID auto-generated: `OI` + first two letters of first name + first two of
  last name + year of joining + 4-digit serial for that year.
  Example: `OIJODO20220001` (Odoo India, John Doe, joined 2022, 1st that year).

**Tokens & sessions**
- Access token: JWT, 15 min expiry, `Authorization: Bearer`.
- Refresh token: opaque random string (NOT JWT), 7-day expiry (30-day if
  "Remember Me"), stored **hashed** in `RefreshToken`, delivered as `httpOnly`,
  `secure`, `sameSite=strict` cookie. Never localStorage.
- Refresh rotation: each refresh issues a new token + invalidates the old.
  Reuse of a rotated token revokes the entire token family (theft detection).
- Email verification token: 24h expiry, single-use, resend allowed w/ 60s cooldown.
- Password reset token: 1h expiry, single-use, invalidates all refresh tokens on
  successful reset.

**Rate limits** (per IP unless noted)
- `/auth/login`: 5/min · `/auth/register`: 3/min · `/auth/forgot-password`:
  3 / 15 min · all other authenticated routes: 100/min per user.

**Pagination/search/sort/filter** (every list endpoint)
- Params: `page` (def 1), `pageSize` (def 20, max 100), `sort` (e.g. `-createdAt`),
  `search`, + resource-specific filters.
- Response `meta`: `{ page, pageSize, total, totalPages }`.

**File uploads**
- Max: 5 MB images, 10 MB docs. Types: images `jpg/png/webp`; docs `pdf/jpg/png`.
- Path: `uploads/{employeeId}/{category}/{uuid}-{originalFilename}`.
- Reject with `422` on type/size violation BEFORE touching disk.

**Attendance**
- Working hours = checkout − checkin, server-side. Half-day threshold configurable,
  default 4h worked. No check-out without a same-day check-in. No cron auto-absent
  (Admin marks manually — documented limitation). All timestamps UTC; display in
  org timezone (default `Asia/Kolkata`).

**Leave**
- `LeaveBalance` entity: remaining days per employee per type per calendar year.
  Init on profile creation w/ admin-configurable defaults (Paid 18, Sick 10,
  Unpaid unlimited). Reject overlapping pending/approved requests. Deduct on
  approval, restore on rejection or employee-cancel of a pending request. Duration
  = inclusive calendar days (no weekend/holiday exclusion — documented simplification).

**Notifications — triggers**
- Leave submitted → Admin/HR. Leave approved/rejected → requesting employee.
  Payroll generated → employee. Email verified → employee. Document uploaded/rejected
  → Admin. Mark-as-read endpoint required.

**Currency & locale**
- INR, stored as integer **paise** (no floats). Formatted on display.

## Data Model (Section 5)

Entities: `User`, `EmployeeProfile`, `Attendance`, `LeaveRequest`, `LeaveBalance`,
`Payroll`, `SalaryStructure`, `Document`, `Notification`, `RefreshToken`.

Every model: UUID PK (`@default(uuid())`), `createdAt`, `updatedAt`.
Soft delete (`deletedAt DateTime?`) on `User`, `EmployeeProfile`, `LeaveRequest`,
`Document` — never hard-delete employee-linked records.
Enums: `Role` (EMPLOYEE, ADMIN), `AttendanceStatus` (PRESENT, ABSENT, HALF_DAY,
LEAVE), `LeaveType` (PAID, SICK, UNPAID), `LeaveStatus` (PENDING, APPROVED,
REJECTED, CANCELLED), `EmploymentStatus` (ACTIVE, ON_LEAVE, TERMINATED).
Index FKs + list-filter columns (`Attendance.date`, `LeaveRequest.status`,
`EmployeeProfile.department`). Write full `schema.prisma` before any controller.

## Auth & Security (Section 6)

- Every protected route: `authenticate` middleware + `authorize(role)` where needed.
- Ownership checks, not just role checks: an Employee hitting `GET /employees/:id`
  or `PATCH /leave/:id` only succeeds on own records; Admin bypasses.
- Input sanitization on every mutating route in addition to Zod (strip unexpected
  fields, escape stored-XSS on free-text like leave `reason`/`remarks`).
- `helmet` + explicit CSP. CORS locked to frontend origin from env, never `*`.

## API Contract (Section 7)

Success: `{ success: true, data: {...}, meta?: {...} }`
Error: `{ success: false, error: { code, message, fields? } }`
Codes: 200 read · 201 create · 204 delete (no body) · 400 malformed · 401
unauthenticated · 403 unauthorized · 404 not found · 409 conflict · 422 validation
· 429 rate limited · 500 unhandled.
Centralized error handler is the ONLY place that formats error bodies. Controllers
throw typed errors — never format responses directly.

## Tech Stack (pinned — Section 3)

Frontend: Next.js 15 (App Router), React 19, TS, Tailwind, shadcn/ui, React Hook
Form, TanStack Query v5, Axios, Zod.
Backend: Node 20 LTS, Express, TS, ts-node-dev (dev).
DB: PostgreSQL 16. ORM: Prisma (local Postgres, not Accelerate).
Auth: `jsonwebtoken`, bcrypt (cost 12), `express-rate-limit`, `helmet`, `cors`.
Email: Nodemailer → local SMTP (maildev in Docker).
Testing: Jest + Supertest (backend, required); RTL for auth + leave-apply (frontend).
API docs: OpenAPI 3.0 via `swagger-jsdoc` + `swagger-ui-express` at `/api/docs`.
No Firebase/Supabase/BaaS. No ORM other than Prisma.

## Folder Structure (Section 4 — keep)

```
backend/src/{config,controllers,middleware,routes,services,validators,types,lib,uploads}
prisma/{schema.prisma,migrations,seed.ts}
frontend/{app,components,hooks,lib,services,types,schemas}
```

## Execution Plan (Section 11)

| Phase | Scope |
|---|---|
| 0 | Scaffolding: structure, tooling, lint/format, docker skeleton, scaffold files |
| 1 | Prisma schema, migrations, seed |
| 2 | Auth module + tests |
| 3 | Employee profile + RBAC middleware |
| 4 | Attendance module |
| 5 | Leave module |
| 6 | Payroll module |
| 7 | Notifications + File Upload |
| 8 | Frontend shell (extract design system into CONTEXT.md FIRST) |
| 9 | Frontend feature pages |
| 10 | Cross-cutting UI polish |
| 11 | Docs & packaging |

## Design System Gate (before Phase 8)

Extract a concrete design system from `DESIGN.md` into `CONTEXT.md`: color tokens
(Tailwind values), type scale, spacing scale, button/card/input/nav patterns,
signature layout conventions (radius, shadow depth, density). Build once as shared
Tailwind config + shadcn/ui overrides in Phase 8. Every later frontend phase reuses
these tokens/components — never re-derive from `DESIGN.md` per page.

## When to Ask vs Assume (Section 14)

Ask a single specific question only when a decision is expensive to reverse AND not
covered by Section 2. Everything else: apply the default, log it in `PROGRESS.md`,
move on. Never pause for stylistic/naming questions.
