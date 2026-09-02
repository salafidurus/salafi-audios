# Deployment Policy

## Environment model

Salafi Durus uses three environments:

- **development**: local development and CI validation;
- **preview**: staging-like validation with production-like behavior;
- **production**: live traffic and stricter operational controls.

The environment must be explicit in configuration. Clients must not infer it
only from hostname patterns.

## Branch promotion

Protected branches map to validation or deployment stages:

```text
main       → default integration branch and development baseline
preview    → Preview backend deployment
production → Production backend deployment
```

Changes enter protected branches through pull requests. Preview and production
backend deployments are promoted from approved immutable container artifacts;
promotion does not rebuild the application.

## Specification pull-request validation

Pull requests targeting a disposable `spec/<slug>` integration branch receive
the repository checks needed to validate the feature candidate, including
build, test, lint, database compatibility, Docker, and applicable feature
validation. A specification branch is a validation target only: deployment,
release promotion, Dependabot synchronization, and other privileged workflows
remain restricted to their existing main or release branches.

## Configuration and security

- Environment variables and secrets are isolated per environment.
- Backend secrets remain on the backend or in secure secret stores.
- Clients receive only explicit public configuration.
- Critical configuration fails fast when missing or invalid.
- Credentials must be scoped to the minimum required access and remain
  revocable.
- Direct pushes to protected deployment branches are blocked.
- Hard-coded secrets and runtime configuration mutation are prohibited.

## Backend delivery

The API follows a build-once/promote-many flow:

```text
trusted preview PR → immutable sha-<commit> image → test
preview merge → :preview promotion → Preview Dokploy webhook
production merge → same approved digest → :production promotion
                 → Production Dokploy webhook
```

The PR image build uses GitHub Actions BuildKit cache (`cache-from:
type=gha`, `cache-to: type=gha,mode=max`). Preview and Production promotion do
not build; they move tags to existing image digests with `docker buildx
imagetools create`.

The API image is stored in GHCR and pulled by Dokploy. See the
[platform architecture](../architecture.md) and
[Dokploy runbooks](../runbooks/infrastructure/README.md).

## Web and mobile delivery

The web application is delivered through Vercel. Native builds and releases
are delivered through Expo/EAS. These pipelines remain separate from backend
GHCR/Dokploy promotion.

## Redis and data authority

Preview and Production use separate Redis runtime services. Redis supports
caching, throttling, and progress buffering, but PostgreSQL remains the durable
source of truth. Redis must not be treated as a substitute for database
durability.

## Dependency updates and CI

Dependency updates must preserve coupled version matrices such as Expo,
React/React Native, Prisma, NestJS, Turborepo, and TypeScript. Changes must use
the repository’s normal CI and validation commands; hooks must not be bypassed.
