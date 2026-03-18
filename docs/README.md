# Salafi Durus — Documentation Index

This directory contains authoritative documentation for the Salafi Durus platform.

## Quick Navigation

- **[AGENT.md](./AGENT.md)** - Documentation index + timeline summary
- **[Product Overview](./product-overview/AGENT.md)** - Philosophy + gap analysis
- **[Implementation Guide](./implementation-guide/)** - How to build
- **[Guardrails](./implementation-guide/11-guardrails-and-non-goals.md)** - Non-negotiable rules

## Documentation Hierarchy

1. `AGENT.md` files (root, docs, workspaces) - concise reference
2. `product-overview/` - vision and philosophy
3. `implementation-guide/` - concrete guidance
4. `.github/copilot-instructions.md` - quick reference

## Reading Order

New contributors should read:

1. [Root AGENT.md](../AGENT.md) - Monorepo orientation
2. [docs/AGENT.md](./AGENT.md) - Documentation index
3. [product-overview/AGENT.md](./product-overview/AGENT.md) - Philosophy + gap analysis
4. Target workspace `AGENT.md` (e.g., `apps/api/AGENT.md`)

## Sections

### Product Overview

Vision, philosophy, and architectural principles. Defines _why_ the system is designed this way.

### Implementation Guide

Concrete, enforceable guidance. Defines _how_ to build the system while respecting architectural boundaries.

## Documentation as Enforcement

- Architectural changes require documentation updates
- Undocumented behavior is incomplete
- Docs reflect intent, not just implementation

If code and docs conflict, reconcile intentionally.
