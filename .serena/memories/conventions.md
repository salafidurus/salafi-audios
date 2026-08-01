# Code Conventions

## File Naming

- Components/screens: kebab-case (e.g., `admin-users.screen.tsx`)
- Services/utils: kebab-case
- DTOs: PascalCase + `Dto` suffix (e.g., `UserDto`, `LectureDto`)
- Constants: UPPER_SNAKE_CASE

## TypeScript Rules

- Strict mode required (`strict: true`)
- Explicit return types for exported services/repos
- Prefer `unknown` over `any`, then narrow
- No `any` without `// @ts-expect-error` + comment

## API Layer

- DTOs in `packages/core-contracts/src/types/`
- API errors: structured, consistent format
- NestJS services: explicit return type annotation

## Component Patterns

- React hooks: `use*` prefix
- Components: PascalCase
- Controlled inputs: value + onChange (React best practice)
- No console.log in production (error if in linting unless explicitly allowed)

## CSS & Styling

- Design tokens only: no hardcoded colors/spacing/radius
- Token reference format: `var(--token-name)`
- Responsive: mobile-first (base styles for mobile, media queries for larger)
- Modules: `.module.css` co-located with component

## Testing

- Strict TDD: Red → Green → Commit (no exceptions)
- Test location: co-located (`.spec.ts` / `.spec.tsx`)
- What to test: services, hooks, auth/permission boundaries, domain logic
- What NOT to test: framework DI (NestJS), third-party internals, generated artifacts, presentational-only components

## Commits

- Conventional Commits enforced (commitlint)
- Format: `type(scope): description`
  - type: feat, fix, perf, refactor, test, docs, chore
  - scope: app name or package (e.g., `web`, `api`, `native`)
  - description: lowercase, max 50 chars (per line limit)
- Footer: Include `Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>`

## Admin UI Patterns

- SearchBar: real-time onChange (fires on every keystroke), debounced in parent via useMemo
- AdminCard: horizontal layout (thumbnail, content, actions) with metadata array
- Form dialogs: modal with save/cancel buttons, optimistic updates when appropriate
- Lists: card-based (not table-based), responsive stacking on mobile
