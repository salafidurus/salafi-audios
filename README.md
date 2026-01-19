# Salafi Durus

**Salafi Durus** is a curated, offline-first lecture platform designed to preserve, organize, and deliver authentic Salafi knowledge in a structured, reliable, and long-term manner.

This repository contains the **entire system**:

- Mobile application
- Web application
- Backend API
- Shared packages
- Authoritative documentation

The project prioritizes **trust, clarity, and longevity** over novelty or short-term convenience.

---

## Project Goals

Salafi Durus exists to solve several real problems:

- Fragmentation of authentic lectures across platforms
- Lack of structured learning paths (scholars → series → lessons)
- Poor offline support for long-form audio
- Weak moderation and trust boundaries on open platforms
- Loss of continuity across devices

The platform is intentionally:

- **Curated**, not crowdsourced
- **Structured**, not flat
- **Offline-first**, not always-online
- **Server-authoritative**, not client-owned

---

## High-Level Architecture

Salafi Durus is built as a **monorepo** with clear separation of responsibilities:

- **Mobile app** — primary listening experience + fast admin actions
- **Web app** — public discovery + powerful admin/editor workflows
- **Backend API** — single source of truth and authority
- **Shared packages** — types, schemas, and utilities
- **Documentation** — architectural intent and execution plan

The backend enforces all business rules, authorization, and data ownership.  
Clients are intelligent consumers, not authorities.

---

## Repository Structure

```txt
apps/
├── api/        # Backend API (authoritative core)
├── web/        # Web application (public + admin)
└── mobile/     # Mobile application (offline-first)

packages/
├── db/         # Database schema and migrations
├── api-client/ # Typed API client
├── auth-shared/# Shared auth types
├── config/     # Shared config schemas
└── i18n/       # Internationalization

docs/           # Authoritative documentation
```

---

## Documentation (Start Here)

📘 **All architectural decisions for Salafi Durus are documented in `/docs`.**

This documentation is not supplementary. It defines:
- What the system is
- Why it is designed this way
- How it must be implemented
- In what order features should be built

If something in the codebase is unclear, the documentation is the **source of truth**.

### Recommended Reading Order

1. **Product Overview** — vision, philosophy, and architecture  
   `docs/product-overview/`

2. **Implementation Guide** — concrete, enforceable design rules  
   `docs/implementation-guide/`

3. **Timeline** — phased execution plan  
   `docs/timeline/`

👉 Entry point: [`docs/README.md`](./docs/README.md)

---

## Development Workflow

### Branching and Merging

- `main` is the only long-lived branch
- All changes enter via pull requests
- Direct pushes to `main` are blocked
- Required checks must pass before merge

Pull requests are the **only** way code enters the system.

---

### CI/CD and Deployment

Salafi Durus uses a **promotion-based deployment model**, not a push-based one.

- Merging into `main` integrates code
- Deployments to preview and production are triggered explicitly
- Promotions are controlled via **tags**, not branches
- No developer pushes deployment commits from a local machine

This ensures deployments are:
- Auditable
- Reproducible
- Reversible

See:  
`docs/implementation-guide/10-environments-and-configuration.md`

---

## Environments

The platform runs in three environments:

- **development** — continuous integration from `main`
- **preview** — staging-like environment for validation
- **production** — live environment

Environment behavior is consistent across:
- Mobile
- Web
- Backend
- Infrastructure

Configuration and secrets are strictly isolated by environment.

---

## What This Repository Is *Not*

This repository intentionally does **not** aim to be:

- A social platform
- A user-generated content portal
- A recommendation or engagement-driven feed
- A real-time collaborative system

These are conscious non-goals, chosen to preserve:
- Trust
- Clarity
- Editorial responsibility
- Long-term maintainability

---

## Contribution Philosophy

Contributions are welcome **only if** they:

- Respect the documented architecture
- Preserve backend authority
- Maintain clear responsibility boundaries
- Avoid undocumented behavior
- Update documentation when intent or behavior changes

If a change conflicts with the documentation, either:
- the documentation must be updated, or
- the change must be reconsidered

Undocumented shortcuts are treated as defects.

---

## Project Status

At this stage, the project has:

- ✅ Complete architectural documentation
- ✅ Clear execution roadmap
- ⏳ Active implementation following the Timeline

Current work should always align with the **current phase** in:

`docs/timeline/`

---

## License and Usage

License and usage terms will be defined explicitly prior to public release.

Until then:

- This repository is considered **private / internal**
- Redistribution, deployment, or reuse without permission is not allowed

---

## Final Note

Salafi Durus is designed to endure.

This repository exists not merely to ship features, but to preserve authentic knowledge with responsibility and care. Every technical and product decision should serve that purpose.
