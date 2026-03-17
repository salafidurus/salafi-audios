# Next.js Development Guide

Use context7 to query Next.js documentation: `/vercel/next.js` or `/websites/nextjs`

## MCP Server

When dev server is running, `next-devtools-mcp` provides:

- Error detection (build, runtime, type errors)
- Page metadata and routes
- Server Actions inspection
- Development logs
- Migration/upgrade tools

## Project Structure (This Project)

Web app follows `apps/web/src/`:

```
app/       → routing, layouts, metadata ONLY
features/  → domain-oriented UI logic
core/      → API client, auth state, caching
shared/    → reusable primitives (no domain knowledge)
```

## App Router Patterns

### Layouts

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Pages

```typescript
// app/page.tsx (Server Component by default)
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

### Client Components

```typescript
'use client';

export default function InteractiveComponent() {
  const [state, setState] = useState();
  return <button onClick={() => setState(...)}>Click</button>;
}
```

### Server Actions

```typescript
"use server";

export async function submitForm(formData: FormData) {
  // Runs on server
}
```

## Data Fetching

This project uses `@sd/contracts` for API types and React Query hooks:

```typescript
import { useQuery } from '@sd/contracts/query';

function Component() {
  const { data } = useQuery(...);
}
```

## Rules (This Project)

- Web is a CLIENT of backend, not a backend itself
- `app/api/` restricted to thin proxies/webhooks only
- Never duplicate backend business logic
- Business logic in clients = WRONG
- Use design tokens from `@sd/design-tokens`

## Commands

```bash
# Development
pnpm dev:web

# Build
pnpm --filter web build

# Lint
pnpm --filter web lint

# Test
pnpm --filter web test

# E2E (Playwright)
pnpm --filter web test:e2e
pnpm --filter web test:e2e -- e2e/catalog.spec.ts
pnpm --filter web test:e2e -- --grep "test title"
```

## Documentation Lookup

When you need Next.js docs, use context7:

```
Query context7 with library ID: /vercel/next.js
```

Topics: App Router, Pages Router, routing, layouts, loading UI, error handling, parallel routes, intercepting routes, route handlers, middleware, rendering (SSR, SSG, ISR), caching, revalidation, Server Components, Client Components, Server Actions, data fetching, forms, redirects, rewrites, headers, metadata, SEO, images, fonts, scripts, CSS, Tailwind, static export, environment variables, authentication, testing, deployment
