# Infrastructure and DevOps

## 1. Environment Model

Salafi Durus uses three named environments across applications and deployment targets:

- **development**
- **preview**
- **production**

These names should be explicit in configuration. Clients must not infer environment from hostname patterns alone.

## 2. Environment Responsibilities

- **Development**: latest approved work from `main`, debug-friendly settings, CI and internal testing.
- **Preview**: staging-like validation with production-like behavior.
- **Production**: live traffic, real data, stricter controls, and lower tolerance for operational risk.

## 3. Configuration Rules

- Each environment has isolated variables and secrets.
- Backend secrets live only on the backend or in secure secret stores.
- Clients receive only explicit public configuration such as API URLs and other non-sensitive values.
- Missing or invalid critical configuration must fail fast.

## 4. Configuration Sources

- **Backend**: startup-loaded environment variables and secure secret stores.
- **Web**: build-time public variables plus server-side runtime configuration where appropriate.
- **Mobile**: build-time injected public configuration and environment-specific app config.

Schemas may be shared across apps, but values are never shared through packages.

## 5. Branch-Deploy Workflow

Deployments follow protected branch promotion:

- `main` -> development
- `preview` -> preview
- `production` -> production

### Promotion Rules

1. All changes enter `main` via pull request.
2. Promotions to `preview` and `production` happen through pull requests between protected branches.
3. Rollbacks are handled by revert or restore through reviewed pull requests.

## 6. Security and Auditability

- Direct pushes to deployment branches are blocked.
- Promotion history is visible through commits and pull requests.
- Credentials must be revocable and scoped to minimum required access.
- Hard-coded secrets, runtime config mutation, and implicit environment inference are avoided.
