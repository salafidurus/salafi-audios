# AGENT.md - Documentation Index

This directory contains authoritative documentation for Salafi Durus.

## Documentation Hierarchy

1. **Root AGENT.md** → Monorepo orientation
2. **This file** → Documentation index + timeline summary
3. **`product-overview/AGENT.md`** → Product philosophy + gap analysis
4. **Workspace AGENT.md** → `apps/api/`, `apps/web/`, `apps/mobile/`, `packages/*/`
5. **`.github/copilot-instructions.md`** → Quick reference

## Sections

### Product Overview (`product-overview/`)

Vision, philosophy, and architectural principles. Defines _why_ the system is designed this way.

**Key files:**

- `01-vision-and-purpose.md` - Mission and goals
- `02-product-philosophy.md` - Core principles (trust, usability, longevity)
- `04-system-architecture.md` - High-level system structure

### Implementation Guide (`implementation-guide/`)

Concrete, enforceable guidance. Defines _how_ to build.

**Critical files:**

- `01-monorepo-structure.md` - Repository layout, dependency rules
- `02-backend-architecture.md` - Backend layering, module structure
- `11-guardrails-and-non-goals.md` - Non-negotiable rules

---

## Timeline Summary

| Phase | Name                | Status      | Key Deliverables                            |
| ----- | ------------------- | ----------- | ------------------------------------------- |
| 01    | Foundations         | COMPLETE    | Monorepo, CI/CD, environments               |
| 02    | Model & Ingestion   | COMPLETE    | Schema, Prisma, ingestion pipeline          |
| 03    | Read-Only Catalog   | PARTIAL     | APIs exist; web/mobile detail pages missing |
| 04    | Auth & User State   | NOT STARTED | Authentication, sessions, user state        |
| 05    | Playback & Progress | NOT STARTED | Audio player, progress tracking             |
| 06    | Offline & Downloads | NOT STARTED | Offline playback, outbox sync               |
| 07    | Admin & Uploads     | NOT STARTED | Admin workflows, moderation                 |
| 08    | Polish & Analytics  | NOT STARTED | UX polish, analytics integration            |

---

## Documentation as Enforcement

- Architectural changes require documentation updates
- Undocumented behavior is considered incomplete
- Docs reflect intent, not just implementation
- If implementation diverges from docs, reconcile intentionally

---

## Keeping Docs in Sync

When implementing features, update:

1. **Workspace AGENT.md** - Add/update feature notes
2. **`product-overview/AGENT.md`** - Update gap analysis status
3. **Relevant implementation-guide** - If patterns change

---

## Quick Links

- [Root AGENT.md](../AGENT.md) - Monorepo orientation
- [Product Overview AGENT.md](./product-overview/AGENT.md) - Philosophy + gap analysis
- [Implementation Guide](./implementation-guide/)
- [Guardrails](./implementation-guide/11-guardrails-and-non-goals.md)
