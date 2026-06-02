# Backend and API Specification

## 1. Backend Role

The backend (`apps/api`) is the authoritative core of the platform. It owns authentication, authorization, validation, workflow orchestration, content visibility, and integrity rules.

## 2. Backend Architecture

The backend follows a layered NestJS architecture.

### Layers

- **Interface**: controllers, DTO validation, guards, and request mapping.
- **Application**: service-layer use cases, orchestration, and transaction boundaries.
- **Domain**: invariants, state transition rules, and business concepts.
- **Infrastructure**: database access, media adapters, and external service integrations.

### Working Rules

- Controllers do not own business decisions.
- Business rules live in services and domain logic.
- Infrastructure provides capabilities but does not decide policy.
- Shared DTOs and response types are defined in `@sd/core-contracts`.

## 3. API Design Rules

The API is resource-oriented and intent-driven.

### Contract Rules

- Use plural nouns for primary resources.
- Keep contracts stable and explicit.
- Prefer additive evolution over breaking churn.
- Treat the API as the boundary shared by web, mobile, and backend tooling.

### Request and Response Rules

- JSON in and JSON out.
- Validate input shape at the interface boundary.
- Normalize errors into a predictable structure.
- Use pagination, filtering, and ordering explicitly rather than implicit client assumptions.

## 4. API Surface Segmentation

- **Public read APIs**: published catalog, search, recommendations, and other discovery endpoints.
- **Authenticated user APIs**: personal state and account-scoped actions.
- **Editorial/admin APIs**: protected content management and moderation operations.
- **Operational APIs**: health, diagnostics, and limited developer-facing documentation when enabled.

This segmentation matters more than route naming because trust boundaries are different for each surface.

## 5. Authentication and Authorization

Authentication and authorization are centralized in the backend.

### Authentication

- The current auth implementation is **Better Auth**.
- Identity is established through backend-managed auth flows and sessions.
- Web and mobile consume auth as clients; neither client owns the trust model.

### Authorization

- Roles are explicit and backend-enforced.
- Authorization is checked for every protected action, not inferred from the UI.
- Scoped editor permissions must be evaluated dynamically against the affected scholar, collection, or content area.
- Offline state or cached client data never grants authority.

## 6. Media and Analytics Through the API

- Media uploads must be authorized by the backend before clients can write to storage.
- Media delivery may be CDN-backed, but access patterns are still governed by backend-issued references and content visibility rules.
- Analytics endpoints are intentionally isolated from authoritative core state.

## 7. Contracts and Documentation

- `@sd/core-contracts` is the shared TypeScript contract package for clients and server.
- Swagger/OpenAPI may be exposed in development at `/api/docs` when enabled.
- Public client base URLs are configured via `NEXT_PUBLIC_API_URL` for web and `EXPO_PUBLIC_API_URL` for mobile.

## 8. Evolution Rules

- Prefer extending contracts over replacing them.
- Deprecate intentionally rather than letting clients drift.
- If API behavior changes materially, update docs and `@sd/core-contracts` together.
