# Salafi Durus — Documentation Index

## Purpose of This Documentation

This directory contains the **authoritative documentation** for the Salafi Durus platform.

These documents are not supplementary or optional. They define:
- Product vision and philosophy
- Architectural intent
- Implementation boundaries
- Execution order

All design and implementation decisions should align with the content in this directory.

---

## How to Read These Docs

The documentation is organized into **three major sections**, each serving a distinct purpose:

1. **Product Overview** — *What we are building and why*
2. **Implementation Guide** — *How we are building it*
3. **Timeline** — *In what order we are building it*

New contributors are strongly encouraged to read the documents **in order**.

---

## 1. Product Overview

📁 `docs/product-overview/`

This section defines the **vision, philosophy, and architectural principles** of Salafi Durus.

It explains *why* the system is designed the way it is, and what values guide technical decisions.

### Files

- [`01-vision-and-purpose.md`](./product-overview/01-vision-and-purpose.md)  
  The mission, goals, and problem Salafi Durus solves.

- [`02-product-philosophy.md`](./product-overview/02-product-philosophy.md)  
  Core principles such as curation, structure, offline-first design, and longevity.

- [`03-user-roles.md`](./product-overview/03-user-roles.md)  
  Definition of listeners, administrators, and scholar editors.

- [`04-system-architecture.md`](./product-overview/04-system-architecture.md)  
  High-level system structure and responsibility separation.

- [`05-data-and-media-ownership.md`](./product-overview/05-data-and-media-ownership.md)  
  How data, media, and analytics are categorized and owned.

- [`06-platform-responsibilities.md`](./product-overview/06-platform-responsibilities.md)  
  Clear boundaries between mobile, web, backend, and infrastructure.

- [`07-offline-and-sync-philosophy.md`](./product-overview/07-offline-and-sync-philosophy.md)  
  Conceptual approach to offline usage and eventual consistency.

- [`08-security-and-trust-boundaries.md`](./product-overview/08-security-and-trust-boundaries.md)  
  Trust model, authorization philosophy, and security boundaries.

- [`09-scalability-and-evolution.md`](./product-overview/09-scalability-and-evolution.md)  
  How the platform grows without losing its principles.

📌 **Read this section first.**  
It defines the intent that everything else enforces.

---

## 2. Implementation Guide

📁 `docs/implementation-guide/`

This section translates philosophy into **concrete, enforceable guidance**.

It explains how the system should be structured, where logic belongs, and what patterns must be followed — without diving into framework-specific code.

### Files

- [`01-monorepo-structure.md`](./implementation-guide/01-monorepo-structure.md)  
  Repository layout, workspace rules, and dependency boundaries.

- [`02-backend-architecture.md`](./implementation-guide/02-backend-architecture.md)  
  Backend layering, module structure, and authority enforcement.

- [`03-database-and-data-modeling.md`](./implementation-guide/03-database-and-data-modeling.md)  
  Core data modeling principles, schema responsibilities, and migrations.

- [`04-api-design.md`](./implementation-guide/04-api-design.md)  
  API contracts, versioning, public vs private endpoints, and stability rules.

- [`05-authentication-and-authorization.md`](./implementation-guide/05-authentication-and-authorization.md)  
  Identity, sessions, roles, scopes, and enforcement strategy.

- [`06-media-upload-and-delivery.md`](./implementation-guide/06-media-upload-and-delivery.md)  
  Presigned uploads, media replacement, CDN delivery, and constraints.

- [`07-mobile-application-structure.md`](./implementation-guide/07-mobile-application-structure.md)  
  Mobile app architecture (`app / core / features / shared`) and offline responsibilities.

- [`08-offline-sync-mechanics.md`](./implementation-guide/08-offline-sync-mechanics.md)  
  Outbox pattern, synchronization flow, conflict handling, and guarantees.

- [`09-web-application-structure.md`](./implementation-guide/09-web-application-structure.md)  
  Web app structure, public vs admin areas, SEO responsibilities.

- [`10-environments-and-configuration.md`](./implementation-guide/10-environments-and-configuration.md)  
  Environment model, configuration ownership, and tag-based deployment promotion.

- [`11-guardrails-and-non-goals.md`](./implementation-guide/11-guardrails-and-non-goals.md)  
  Explicit rules, forbidden shortcuts, and scope boundaries.

📌 **Read this section before implementing features.**  
It exists to prevent architectural drift.

---

## 3. Timeline

📁 `docs/timeline/`

This section defines the **phased execution plan**.

Each phase builds on the previous one and delivers a meaningful, testable outcome. Phases must be completed **in order**.

### Files

- [`01-foundations.md`](./timeline/01-foundations.md)  
  Repository setup, CI/CD, environments, and skeleton apps.

- [`02-read-only-catalog.md`](./timeline/02-read-only-catalog.md)  
  Public browsing of scholars, series, and lectures (no auth).

- [`03-auth-and-user-state.md`](./timeline/03-auth-and-user-state.md)  
  Authentication, sessions, and user-owned state.

- [`04-playback-and-progress.md`](./timeline/04-playback-and-progress.md)  
  Audio playback, progress tracking, and resume behavior (online).

- [`05-offline-and-downloads.md`](./timeline/05-offline-and-downloads.md)  
  Offline playback, downloads, and outbox synchronization.

- [`06-admin-and-uploads.md`](./timeline/06-admin-and-uploads.md)  
  Admin workflows, single and bulk uploads, moderation.

- [`07-polish-and-analytics.md`](./timeline/07-polish-and-analytics.md)  
  Analytics, performance, UX polish, and operational readiness.

📌 **Use this section as the execution roadmap.**  
Skipping phases or reordering them increases risk.

---

## Documentation as a First-Class Artifact

This documentation is part of the system.

Rules:
- Architectural changes require documentation updates
- Undocumented behavior is considered incomplete
- If implementation diverges from docs, the docs must be updated or the change reconsidered

Documentation reflects **intent**, not just implementation.

---

## Final Note

Salafi Durus is designed for longevity, trust, and clarity.

These documents exist to ensure that:
- Decisions are explicit
- Boundaries are respected
- The system remains understandable as it grows

When in doubt, return to these docs before writing code.
