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

## Deployment Model in a Monorepo (Branch-Deploy Workflow)

## Overview

Salafi Durus uses a **branch-deploy model** to manage deployments in a monorepo while keeping protected branches locked down.

This model ensures that:

- All code changes go through pull requests
- No one pushes directly to protected branches
- Deployments are explicit and environment-scoped
- Development, preview, and production are isolated by branch and environment

---

## Protected Deployment Branches

The deployment branches are protected with the following guarantees:

- `main` (development)
- `preview` (staging/validation)
- `production` (live)

Each protected branch enforces:

- All changes enter via pull requests
- Required checks must pass before merge
- Direct pushes are blocked
- Force pushes are disabled

Each branch represents the latest approved state for its corresponding environment.

---

## Deployment Strategy

Deployment execution may be handled by external platform dashboards (for example, Render, Vercel, and EAS), while GitHub remains the source of promotion state via protected branches.

### Development

- Every successful merge into `main` may deploy automatically to **development**
- Deployments are path-aware (only affected apps are built/deployed)

---

### Preview and Production (Branch Promotion)

Preview and production deployments occur when changes are promoted via pull requests into their protected branches.

Promotion is performed by:

- Opening pull requests from the currently approved source branch
- Merging only after required checks pass
- Never pushing commits directly

---

## Promotion Rules

- Pull requests into protected deployment branches must pass required CI
- Promotion into `preview` or `production` must come from approved upstream branch state
- Environment branches imply compatibility across all deployable apps in that branch
- Optional path-aware deploy logic may deploy only affected apps

Branch history provides the promotion trail.

---

## Rollback Strategy

Rollback is performed by reverting or restoring the protected branch to a previously known-good commit via pull request.

This makes rollback:

- Fast
- Safe
- Auditable

---

## Why Branch-Deploy Is Preferred

This approach provides:

- Explicit control over deployments
- Clear branch-to-environment mapping
- Pull-request-based audit trail for promotions and rollbacks
- Compatibility with monorepo tooling
- Strong auditability and traceability

---

## Closing Note

Environment configuration and deployment workflows are first-class architectural concerns in Salafi Durus.

By combining protected branches, explicit configuration ownership, and branch-based deployment, the platform achieves safety without sacrificing flexibility.

All deployment processes must adhere to the rules defined in this document.
