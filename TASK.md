# TASK.md — Current Phase Checklist

## Phase 2 — Auth module + tests

**DoD:** All 7 auth endpoints work end-to-end incl. real email delivery to maildev;
Supertest suite green.

### The 7 endpoints (Section 8 flow)
- [ ] `POST /auth/register` → creates EMPLOYEE user + profile + login ID + leave
      balances; sends verification email; rate-limit 3/min
- [ ] `POST /auth/verify-email` (token) → marks verified, fires EMAIL_VERIFIED
      notification; single-use, 24h expiry
- [ ] `POST /auth/resend-verification` → 60s cooldown
- [ ] `POST /auth/login` → blocked until verified; issues access JWT (15m) + refresh
      cookie (httpOnly/secure/strict); rate-limit 5/min; supports Remember Me (30d)
- [ ] `POST /auth/refresh` → rotation (new refresh, invalidate old); reuse of rotated
      token revokes the whole family
- [ ] `POST /auth/logout` → revokes current refresh token
- [ ] `POST /auth/forgot-password` (rate 3/15min) + `POST /auth/reset-password`
      (1h token, single-use, invalidates all refresh tokens)

### Building blocks
- [ ] `services/auth.service.ts` — register/verify/login/refresh/logout/reset logic
- [ ] `services/token.service.ts` — access JWT sign/verify, opaque refresh gen+hash,
      rotation + family revoke
- [ ] `services/email.service.ts` — Nodemailer → SMTP (maildev); verify + reset templates
- [ ] `lib/password.ts` — bcrypt hash/compare (cost 12)
- [ ] `lib/crypto.ts` — opaque token gen + hash (sha256) for refresh/verify/reset
- [ ] `validators/auth.validators.ts` — Zod schemas (mirror to frontend later)
- [ ] `middleware/authenticate.ts` — verify access token, attach user
- [ ] `middleware/rateLimit.ts` — per-route limiters (Section 2 limits)
- [ ] `middleware/validate.ts` — Zod body/query validation → 422 via error handler
- [ ] `controllers/auth.controller.ts` + `routes/auth.routes.ts`
- [ ] Wire routes + cookie config into `app.ts`

### Security (Section 6)
- [ ] Refresh token: opaque, hashed at rest, httpOnly/secure/sameSite=strict cookie
- [ ] Access token: 15m, Bearer
- [ ] Rotation + theft detection (family revoke on reuse)
- [ ] Input sanitization on mutating routes
- [ ] Generic messages on login/forgot (no user-enumeration leak)

### Tests (Supertest — Section 10: happy + 1 auth-fail + 1 validation-fail min per endpoint)
- [ ] register / verify / login / refresh / logout / forgot / reset suites
- [ ] Real email lands in maildev (assert via maildev REST API on :1080)
- [ ] Test DB strategy (transaction/cleanup) documented

### Verify + close
- [ ] Full auth flow green end-to-end against maildev
- [ ] Update PROGRESS.md, append CONTEXT.md, rewrite TASK.md for Phase 3, commit
