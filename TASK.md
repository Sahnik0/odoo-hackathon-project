# TASK.md — Current Phase Checklist

## Phase 3 — Auth (frontend) + Design System Gate

**DoD:** Design tokens extracted once into `CONTEXT.md` + wired into Tailwind/shadcn.
Register→verify→login→protected-route→refresh→logout works end-to-end in the
browser against the real backend (no mocks).

### Design System Gate (do first — every later page reuses this)
- [ ] Extract color tokens, type scale, spacing scale, radius/shadow from
      `DESIGN.md` into `CONTEXT.md` (concrete Tailwind v4 `@theme` values)
- [ ] Wire tokens into `frontend/app/globals.css` `@theme` block
- [ ] shadcn/ui init + base component overrides (button, card, input, dialog) using
      the tokens (pill radius, off-black/lake-blue action colors, Ash borders,
      no shadows on cards per DESIGN.md's Don'ts)
- [ ] Base layout shell: nav, page container (max-width 1432px per DESIGN.md)

### API client + state
- [ ] `lib/axios.ts` — Axios instance, `baseURL` from `NEXT_PUBLIC_API_URL`
- [ ] Refresh interceptor: on 401, silently call `/auth/refresh` once, retry the
      original request; on refresh failure, redirect to `/login`
- [ ] `lib/queryClient.ts` — TanStack Query v5 provider in root layout
- [ ] `schemas/auth.ts` — Zod schemas mirroring `backend/src/validators/auth.validators.ts`
      field-for-field (register/login/forgot/reset)

### Pages
- [ ] `/register` — RHF + Zod, calls `POST /auth/register`, shows "check your email" state
- [ ] `/verify-email` — reads token from query param, calls `POST /auth/verify-email`
- [ ] `/login` — RHF + Zod, calls `POST /auth/login`, stores access token in memory
      (not localStorage — Section 2), redirects to dashboard
- [ ] `/forgot-password` — calls `POST /auth/forgot-password`
- [ ] `/reset-password` — reads token from query param, calls `POST /auth/reset-password`
- [ ] Protected layout — redirects to `/login` if no valid session; role-aware
      (Admin vs Employee) nav/dashboard shell

### Tests
- [ ] RTL test: login flow (Section 10 requirement — the one frontend suite
      that's explicitly required, not optional)

### Verify + close
- [ ] Manual walkthrough: register → check maildev → verify → login → hit a
      protected page → refresh → logout, all against the real backend
- [ ] Update PROGRESS.md, append CONTEXT.md, rewrite TASK.md for Phase 4, commit

---

## Backlog (vertical slices, in order — see INSTRUCTIONS.md §11)

- Phase 4 — Employee Profile frontend (backend already done)
- Phase 5 — Attendance frontend (backend already done)
- Phase 6 — Leave Management frontend (backend already done)
- Phase 7 — Payroll frontend (backend already done)
- Phase 8 — Notifications + File Upload frontend (backend already done)
- Phase 9 — Cross-cutting UI polish (all modules)
- Phase 10 — Docs, Docker, README, final QA
