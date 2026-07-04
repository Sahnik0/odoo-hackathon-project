# TASK.md — Current Phase Checklist

## Phase 4 — Attendance module

**DoD:** Check-in/out, all three view granularities, Admin filters all functional
and tested.

### Rules (Section 2)
- [ ] Working hours = checkout − checkin, computed server-side (store workedMinutes)
- [ ] Half-day threshold configurable, default 4h worked → status HALF_DAY
- [ ] No check-out without a matching check-in on the same calendar day
- [ ] One attendance row per employee per calendar day (unique) — enforce on check-in
- [ ] All timestamps stored UTC; display in org timezone (default Asia/Kolkata)
- [ ] No cron auto-absent — Admin marks absences manually (documented limitation)

### Endpoints
- [ ] `POST /attendance/check-in` — employee, own; rejects double check-in same day
- [ ] `POST /attendance/check-out` — employee, own; rejects if no check-in today;
      computes workedMinutes + status (PRESENT/HALF_DAY)
- [ ] `GET /attendance/me` — own records; `view=daily|weekly|monthly` granularity
- [ ] `GET /attendance` — Admin; filters dept/date(range)/employee/status; paginated
- [ ] `POST /attendance/mark-absent` — Admin; manual absence for an employee/date
- [ ] (decide) `PATCH /attendance/:id` — Admin correction? or fold into mark-absent

### Building blocks
- [ ] `services/attendance.service.ts` (check-in/out, views, admin filters, mark-absent)
- [ ] `validators/attendance.validators.ts`
- [ ] `controllers/attendance.controller.ts` + `routes/attendance.routes.ts`
- [ ] `lib/time.ts` — UTC "today" per org timezone, week/month range helpers
- [ ] Resolve current user's employeeProfileId (helper — reused by leave/payroll)

### Tests (Supertest)
- [ ] Check-in creates a PRESENT row; second check-in same day → 409
- [ ] Check-out without check-in → 409/400
- [ ] Check-out computes workedMinutes; < threshold → HALF_DAY
- [ ] daily/weekly/monthly views return correct ranges
- [ ] Admin filter by status/date/employee; employee hitting admin list → 403
- [ ] mark-absent by admin; non-admin → 403
- [ ] Validation-fail case

### Verify + close
- [ ] All three view granularities + admin filters tested green
- [ ] Update PROGRESS.md, append CONTEXT.md, rewrite TASK.md for Phase 5, commit
