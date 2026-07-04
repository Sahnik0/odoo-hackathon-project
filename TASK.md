# TASK.md — Current Phase Checklist

## Phase 3 — Employee profile + RBAC middleware

**DoD:** Field-level edit restrictions enforced server-side and tested, not just
UI-hidden.

### Endpoints (Section 8)
- [ ] `GET /employees` — Admin only; paginated/search/sort/filter (dept, status);
      `meta` block
- [ ] `GET /employees/:id` — Admin any; Employee only own (ownership check)
- [ ] `GET /employees/me` — current user's profile (convenience)
- [ ] `POST /employees` — Admin only; creates User(EMPLOYEE)+profile+login ID+balances
      (admin-created accounts; may pre-verify or send verification — decide + log)
- [ ] `PATCH /employees/:id` — **field-level RBAC**: Employee may edit only
      `phone`, `address`, `profilePicture` on their own record; all other fields
      Admin-only; Admin may edit any field on anyone
- [ ] `DELETE /employees/:id` — Admin only; soft delete (`deletedAt`), never hard
- [ ] `PATCH /employees/:id/status` — Admin only; employmentStatus (ACTIVE/ON_LEAVE/
      TERMINATED) — or fold into PATCH; pick one + document

### RBAC / ownership
- [ ] `authorize(ADMIN)` on admin-only routes
- [ ] Ownership helper: Employee restricted to own profile; Admin bypasses (Section 6)
- [ ] Field-level guard: split editable field sets by role, enforced in the service
      (reject/strip admin-only fields from employee requests → 403 or 422, decide)

### Building blocks
- [ ] `services/employee.service.ts`
- [ ] `validators/employee.validators.ts` (separate employee-self vs admin update schemas)
- [ ] `controllers/employee.controller.ts` + `routes/employee.routes.ts`
- [ ] Shared list-query helper (page/pageSize/sort/search/filter → Prisma args + meta)
- [ ] Apply `authenticate` + `authenticatedLimiter` to protected routes

### Tests (Supertest)
- [ ] Employee editing an allowed field on own profile → 200
- [ ] Employee editing an admin-only field (e.g. department/salary link) → rejected
- [ ] Employee accessing another employee's profile → 403
- [ ] Admin editing any field on any employee → 200
- [ ] List pagination/filter happy + auth-fail (employee hitting admin list → 403)
- [ ] Validation-fail case

### Verify + close
- [ ] Field-level restriction proven server-side by tests
- [ ] Update PROGRESS.md, append CONTEXT.md, rewrite TASK.md for Phase 4, commit
