# Environments and Configuration

## Introduction

Salafi Durus runs across multiple platforms, environments, and deployment targets. Without a clear configuration and promotion strategy, even a well-designed system becomes fragile and error-prone.

This document defines:

- How environments are named
- How configuration is structured
- Where secrets live
- How deployments are promoted safely in a monorepo

The goal is **clarity, isolation, safety, and auditability**.

---

## Environment Model

Salafi Durus uses a consistent environment model across all platforms.

### Supported Environments

The system defines three environments:

- **development**
- **preview**
- **production**

These environment names are shared across:

- Mobile
- Web
- Backend
- Infrastructure

A single environment identifier (`APP_ENV`) is used to determine behavior.

---

## Environment Responsibilities

Each environment serves a specific purpose:

### Development

- Continuous integration target
- Latest merged code from `main`
- Debug-friendly settings
- Test data and non-critical integrations

### Preview

- Staging-like environment
- Production-like configuration
- Internal testing and validation
- Safe place to verify releases before production

### Production

- Live user traffic
- Real data
- Strict security controls
- Minimal logging verbosity

Environment boundaries must never blur.

---

## Configuration Ownership

Configuration is owned according to responsibility.

### Backend Configuration

The backend owns:

- Database credentials
- Authentication secrets
- Media storage credentials
- Analytics credentials
- Authorization rules

Backend configuration is **never** exposed to clients.

---

### Client Configuration

Mobile and web clients receive only:

- API base URLs
- Media base URLs
- Environment identifiers
- Non-sensitive feature flags

Clients do not receive:

- Secrets
- Credentials
- Infrastructure access

---

## Configuration Sources

### Backend

Backend configuration is sourced from:

- Environment variables
- Secure secret stores (where available)

Configuration is:

- Loaded at startup
- Validated explicitly
- Treated as immutable at runtime

Invalid configuration must cause startup failure.

---

### Mobile Application

Mobile configuration is provided through:

- Build-time environment injection
- Platform-specific configuration files
- Explicit public environment variables

Only variables explicitly marked as public are accessible at runtime.

---

### Web Application

Web configuration is provided through:

- Build-time environment variables
- Server-side runtime configuration
- Explicit public variable prefixes

Public variables are limited strictly to non-sensitive values.

---

## Public vs Private Configuration

### Public Configuration

Public configuration may include:

- API endpoints
- Media endpoints
- Environment identifiers
- Non-sensitive feature toggles

Public configuration must be safe to expose.

---

### Private Configuration

Private configuration includes:

- Secrets
- Credentials
- Tokens
- Internal service URLs

Private configuration:

- Exists only on the backend
- Is never committed to source control
- Is never transmitted to clients

---

## Shared Configuration Schemas

To prevent misconfiguration, Salafi Durus uses shared configuration schemas.

These schemas:

- Define required variables
- Enforce types and formats
- Provide early failure on misconfiguration

Schemas may be shared across applications, but **values are never shared**.

---

## Naming Conventions

### Environment Variables

Naming conventions are enforced:

- Backend: descriptive names without prefixes
- Web public variables: explicitly prefixed
- Mobile public variables: explicitly prefixed

This makes variable intent obvious and prevents accidental leakage.

---

## Domain and URL Configuration

Each environment has its own set of URLs:

- API endpoints
- Web domains
- Media/CDN endpoints

Clients must never infer environment from URL patterns. The environment identifier is always explicit.

---

## Configuration and Builds

Configuration is resolved at:

- Build time (for static configuration)
- Startup time (for backend services)

Runtime mutation of configuration is avoided.

Build artifacts are environment-specific and must not be reused across environments.

---

## Failure and Safety

Configuration failures are treated as critical.

If configuration is:

- Missing
- Invalid
- Inconsistent

The system must fail early and loudly.

Silent fallback behavior is explicitly avoided.

---

## Auditing and Rotation

Secrets and credentials:

- Are rotated periodically
- Are revocable
- Are scoped to the minimum required access

Configuration changes are tracked and audited where possible.

---

## Avoided Anti-Patterns

Salafi Durus intentionally avoids:

- Environment inference via hostname alone
- Hard-coded configuration values
- Sharing secrets through code or packages
- Dynamic configuration mutation at runtime

These patterns lead to fragile systems.

---

## Deployment Promotion in a Monorepo (Tags-Based Workflow)

## Overview

Salafi Durus uses a **tag-based promotion model** to manage deployments in a monorepo while keeping the `main` branch fully protected.

This model ensures that:

- All code changes go through pull requests
- No one pushes directly to `main`
- Deployments are explicit, auditable, and reversible
- Preview and production are pinned to exact commits

---

## Protected Main Branch

The `main` branch is protected with the following guarantees:

- All changes enter via pull requests
- Required checks must pass before merge
- Direct pushes are blocked
- Force pushes are disabled

`main` always represents the latest integrated development state.

---

## Deployment Strategy

### Development

- Every successful merge into `main` may deploy automatically to **development**
- Deployments are path-aware (only affected apps are built/deployed)

---

### Preview and Production (Manual Promotion)

Preview and production deployments occur **only through manual promotion**, not automatically on merge.

Promotion is performed by:

- Creating or moving specific Git tags
- Using a controlled GitHub workflow or UI
- Never pushing commits directly

---

## Tag Types

### Immutable Release Tags (Snapshots)

Immutable tags capture a snapshot of the repository at a point in time.

Format:

```txt
release/YYYY-MM-DD.N
```

Example:

```txt
release/2026-01-19.1
```

These tags:

- Never move
- Represent exact release candidates
- Enable easy rollback and audit

---

## Environment Promotion Tags (Moving Pointers)

Promotion tags indicate what is currently deployed to an environment.

Environment-wide tags:

```txt
env/preview
env/production
```

Targeted tags (optional):

```txt
env/preview/api
env/preview/web
env/preview/mobile
```

```txt
env/production/api
env/production/web
env/production/mobile
```

---

## Promotion Rules

- Promotion tags must point to commits already on main
- Promotion occurs only after CI has passed
- Environment-wide tags imply compatibility across all apps
- Targeted tags deploy only the specified app

Promotion tags may move over time; release tags must not.

---

## Rollback Strategy

Rollback is performed by moving promotion tags back to a previous release tag commit.

No code changes or reverts are required.

This makes rollback:

- Fast
- Safe
- Auditable

---

## Why Tags Are Preferred

This approach provides:

- Explicit control over deployments
- No reliance on long-lived environment branches
- Clear separation between integration and promotion
- Compatibility with monorepo tooling
- Strong auditability and traceability

---

## Closing Note

Environment configuration and deployment promotion are first-class architectural concerns in Salafi Durus.

By combining protected branches, explicit configuration ownership, and tag-based promotion, the platform achieves safety without sacrificing flexibility.

All deployment processes must adhere to the rules defined in this document.
