# Vercel Web Deployment

## Scope

This runbook covers deployment of the Next.js web application in `apps/web` to
Vercel. Backend API, Redis, Dokploy, and GHCR operations are separate concerns.

## Repository configuration

The active Vercel configuration is `apps/web/vercel.json`:

- Bun `1.x` is selected.
- Installation uses `bun ../../scripts/deploy/install.mjs web`.
- The build uses `bun ../../scripts/deploy/build.mjs web`.

These commands run from the Vercel project context while resolving the
repository-root deployment scripts for the `web` workspace.

## Environment boundaries

Vercel hosts the web application. It does not host the NestJS API, PostgreSQL,
Redis, Dokploy, or the API container images. The web application reaches the
API through its configured public API origin; values are supplied through the
Vercel environment configuration and are not documented here.

Use Vercel’s own project settings and deployment history to verify the active
production and preview projects. Do not infer provider settings from a
hostname, and do not place credentials in this repository.

## Verification

After a deployment, verify the relevant Vercel deployment URL and then verify
the configured API origin through the web application. Backend deployment and
GHCR image promotion are documented separately in the platform architecture
and Dokploy runbooks.
