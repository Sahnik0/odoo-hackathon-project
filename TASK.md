# TASK.md — Current Phase Checklist

## Phase 1 — Prisma schema, migrations, seed

**DoD:** `prisma migrate dev` runs clean; seed produces 1 admin + 5+ employees with
realistic data across ALL entities.

### Schema (`prisma/schema.prisma`) — write the full model before any controller
- [ ] Enums: `Role`, `AttendanceStatus`, `LeaveType`, `LeaveStatus`, `EmploymentStatus`
- [ ] `User` (auth core; email, hashed password, role, verified flag, soft delete)
- [ ] `EmployeeProfile` (login ID `OIxxYYYYNNNN`, dept, employment status, phone,
      address, profilePicture; soft delete)
- [ ] `Attendance` (checkin/checkout UTC, workedHours, status; index `date`)
- [ ] `LeaveRequest` (type, status, start/end, reason, remarks; index `status`; soft delete)
- [ ] `LeaveBalance` (per employee / type / year; remaining days)
- [ ] `SalaryStructure` (components, amounts in integer paise)
- [ ] `Payroll` (period, generated entry, amounts in paise)
- [ ] `Document` (category, path, linked to employee; soft delete)
- [ ] `Notification` (type, message, read flag, target user)
- [ ] `RefreshToken` (hashed token, family id, expiry, revoked flag)
- [ ] Every model: UUID PK, `createdAt`, `updatedAt`
- [ ] Soft delete (`deletedAt`) on User, EmployeeProfile, LeaveRequest, Document
- [ ] Indexes on FKs + `Attendance.date`, `LeaveRequest.status`, `EmployeeProfile.department`

### Migration
- [ ] `prisma migrate dev --name init` runs clean against compose Postgres
- [ ] Prisma client generates

### Seed (`prisma/seed.ts`)
- [ ] 1 bootstrap Admin (documented credentials)
- [ ] 5+ Employees with generated login IDs, profiles, employment statuses
- [ ] Realistic cross-entity data: attendance rows, leave requests + balances,
      salary structures + payroll, a document, notifications
- [ ] Idempotent-ish (safe re-run: upsert or clean-then-seed)
- [ ] Passwords hashed (bcrypt cost 12)

### Decisions to log in CONTEXT.md
- [ ] Login-ID serial generation strategy (per-year counter source of truth)
- [ ] Paise storage confirmed on all money fields
- [ ] RefreshToken family/rotation columns

### Verify + close
- [ ] `prisma migrate dev` clean, `npm run seed` populates all entities
- [ ] Update `PROGRESS.md`, append `CONTEXT.md`, rewrite `TASK.md` for Phase 2, commit
