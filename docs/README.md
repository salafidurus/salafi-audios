# Salafi Durus Documentation

This directory contains the standard, top-level documentation for Salafi Durus. It is intentionally compact: the docs here define product intent, architecture, and system rules, while workspace `AGENT.md` files hold package- or app-specific implementation guidance.

## Standard Set

- **[AGENT.md](./AGENT.md)**: Current implementation status, phase summary, and quick navigation.
- **[prd.md](./prd.md)**: Product vision, principles, user roles, trust model, and non-goals.
- **[architecture.md](./architecture.md)**: System architecture, monorepo boundaries, and platform responsibilities.
- **[api.md](./api.md)**: Backend architecture, API contract rules, auth/authz, and media/API boundaries.
- **[database.md](./database.md)**: Data ownership, relational modeling, media references, and migration rules.
- **[mobile.md](./mobile.md)**: Mobile structure, current capabilities, and target offline/sync architecture.
- **[web.md](./web.md)**: Web structure, SEO/discovery responsibilities, and admin/public boundaries.
- **[dev-ops.md](./dev-ops.md)**: Environment model, configuration rules, and branch-deploy workflow.

## Reading Order

1. [Root AGENT.md](../AGENT.md)
2. [docs/AGENT.md](./AGENT.md)
3. [prd.md](./prd.md)
4. [architecture.md](./architecture.md)
5. The relevant technical document in this folder
6. The target workspace `AGENT.md` such as `apps/api/AGENT.md` or `apps/web/AGENT.md`

## How These Docs Work

- These files capture cross-cutting rules and durable architectural intent.
- Workspace `AGENT.md` files capture operational detail, local conventions, and package-specific commands.
- If a detail is only relevant to one app or package, prefer the workspace `AGENT.md` over expanding this folder.

## Documentation as Enforcement

- Architectural changes require documentation updates.
- Undocumented behavior is considered incomplete.
- If code and docs diverge, reconcile them intentionally.
