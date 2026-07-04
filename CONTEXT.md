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
