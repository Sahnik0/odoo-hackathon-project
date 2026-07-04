# PROGRESS.md — Build Progress & Assumptions

## Legend
✅ done · 🚧 in progress · ⬜ pending · ⚠️ assumption/limitation logged

---

## Phase 0 — Scaffolding · 🚧

### Done
- ✅ Read `INSTRUCTIONS.md` + `DESIGN.md`
- ✅ Scaffold files created: `AGENTS.md`, `CONTEXT.md`, `TASK.md`, `PROGRESS.md`

### Pending
- ⬜ Root config (`.gitignore`, `docker-compose.yml`, README stub, `.editorconfig`)
- ⬜ Backend boot skeleton + `/health`
- ⬜ Frontend Next.js scaffold
- ⬜ Docker compose brings up Postgres + maildev clean
- ⬜ Commit Phase 0

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

## Phases 1–11 · ⬜ not started
