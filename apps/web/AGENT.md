# AGENT.md - apps/web (Public + Admin Client)

This Next.js app is a client of the backend API, not an authority.

## Core responsibilities

- Public discovery (SEO-friendly pages, deep links, shareable routes).
- Admin/editor workflows with efficient UI and safe UX.
- Strict adherence to backend contracts and permissions.

## Agent skills scope

- Project-local OpenCode skills live in `.opencode/skills/`.
- Keep Next.js and web-specific skills scoped to this app directory.
- For image-driven UI tasks, run root `google-stitch` first, then adapt output using this file and web-local skills.
- After Stitch baseline generation, enforce web structure (`app/`, `features/`, `core/`, `shared/`) and tokenized styling rules.

## Non-negotiables

- Never move business rules from API into web.
- Authorization is backend-only; UI gating is convenience only.
- Never bypass explicit API transition endpoints.

## Structure and dependency direction

- `app/` - routing/layout/composition only
- `features/` - domain-facing UI/hooks
- `core/` - platform concerns (API wiring, session, caching, error normalization)
- `shared/` - primitives/utilities with no inward deps

Route wrappers in `src/app/**/page.tsx` must:

- Import screen + metadata helpers from `features/*/screens/*`.
- Avoid domain data fetching and feature business logic.
- Keep routing declarative and minimal.

Feature ownership rules:

- Feature folders are vertical slices (`api/`, `screens/`, `components/`, `hooks/`, `store/`, `types/`, `utils/`).
- A feature owns its domain-specific formatting, SEO helpers, UI state, and API wrappers.
- Do not place catalog-specific code in `core/` or `shared/`.

Shared promotion rules:

- Promote code to `shared/` only when at least two features need the same behavior.
- `shared/` stays domain-agnostic (no catalog semantics, no API route knowledge).
- When in doubt, keep code inside the feature until reuse is proven.

API client import policy:

- Import API types/clients only from `@sd/api-client` public exports.
- Never import from `@sd/api-client/generated/*` directly.

Styling policy:

- Use tokenized design primitives from `src/app/globals.css` (light + dark tokens).
- Avoid one-off hardcoded colors/spacing/radius/shadows in feature components.
- Keep green-accent catalog language calm, structured, and readable.

Information architecture:

- Web route IA can diverge from backend endpoint shapes when UX/SEO benefits.
- Backend remains authoritative; web IA is a presentation concern.

Direction:

- features -> core/shared
- core -> shared
- app composes features

## Data-fetching guidance

- Public pages: SSR/SSG as appropriate; respect publication status.
- Auth/admin flows: interactive client paths, backend-authorized.
- Keep client state derived from authoritative API responses.

## Commands (run from repo root)

- Dev: `pnpm dev:web`
- Build: `pnpm --filter web build`
- Lint: `pnpm --filter web lint`
- Typecheck: `pnpm --filter web typecheck`
- Unit/integration tests: `pnpm --filter web test`
- E2E (Playwright): `pnpm --filter web test:e2e`

## Single-test commands

- Jest file: `pnpm --filter web test -- src/path/to/file.test.tsx`
- Jest by name: `pnpm --filter web test -- -t "renders heading"`
- Playwright file: `pnpm --filter web test:e2e -- e2e/catalog.spec.ts`
- Playwright by title: `pnpm --filter web test:e2e -- --grep "catalog list"`
- Playwright project: `pnpm --filter web test:e2e -- --project chromium`

## API contract and codegen

- Do not hand-edit generated API client code.
- Regenerate client from source contracts (`pnpm contract`) when API changes.

## Quality expectations

- Preserve clear separation between UX logic and policy logic.
- Keep errors explicit and user-safe; do not swallow failures.
- Add tests for admin actions and permission-sensitive views.
