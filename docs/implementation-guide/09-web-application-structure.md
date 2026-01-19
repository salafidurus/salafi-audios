# Web Application Structure

## Introduction

The web application of Salafi Durus serves two distinct but complementary roles:

1. A **public-facing platform** for discovery, listening, and sharing
2. A **powerful administrative and editorial interface** for managing content

This document defines how the web application is structured, how responsibilities are divided internally, and how it differs intentionally from the mobile application.

---

## Structural Philosophy

The web application is organized around **audience and responsibility separation**.

It must:

- Be search-engine friendly
- Support deep linking and sharing
- Provide rich editorial tooling
- Remain a pure client of the backend API

The web application does not duplicate backend logic or act as an authority over platform state.

---

## High-Level Structure

The web application follows a layered structure similar in spirit to mobile, but adapted to web-specific needs:

```txt
src/
├── app/          # Routing, layouts, and server components
├── features/     # Domain-oriented UI and logic
├── core/         # Web-specific infrastructure
└── shared/       # Reusable primitives
```

The same dependency direction applies:

- `shared/` is lowest-level and pure
- `core/` builds on `shared/`
- `features/` build on both
- `app/` composes everything

---

## `app/` — Routing and Layout

### Purpose

The app/ directory defines:

- Routes and URL structure
- Page layouts
- Route-level access control
- Server-side rendering behavior

It does not:

- Contain business logic
- Fetch data directly beyond orchestration
- Own application state

### Responsibilities

- Public page routes (scholars, series, lectures)
- Admin route segmentation
- Layout composition
- Metadata and SEO configuration

This keeps routing declarative and predictable.

---

## Public Web Area

### Purpose

The public area of the web application exists to:

- Enable discovery
- Support sharing
- Provide a web-based listening experience

It is optimized for:

- Search engines
- First-time visitors
- Read-heavy usage

### Characteristics

- Accessible without authentication
- Exposes only published content
- Uses server-side rendering or static generation where appropriate
- Delegates all data authority to the backend

Public pages never expose editorial or user-specific data.

---

## Administrative and Editorial Area

### Purpose

The administrative area is a power tool.

It exists to:

- Manage large amounts of content
- Perform bulk operations
- Provide visibility into platform state

### Characteristics

- Requires authentication
- Enforces role-based access
- Uses client-side rendering for interactivity
- Supports complex workflows (bulk uploads, ordering, publishing)

Administrative routes are clearly separated from public routes.

---

## `core/` — Web Infrastructure

### Purpose

The `core/` directory contains web-specific infrastructure.

It provides:

- API client configuration
- Authentication session handling
- Role-aware route guards
- Client-side caching and revalidation logic

### Responsibilities

- API request coordination
- Token handling
- Error normalization
- Session awareness

`core/` contains no domain-specific UI.

---

## `features/` — Domain-Oriented Functionality

### Purpose

The `features/` directory contains vertical slices of functionality aligned with domain concepts.

Each feature:

- Owns its pages, components, and hooks
- Encapsulates its UI logic
- Depends on core/ for infrastructure

### Typical Features

- Scholars
- Series
- Lectures
- Library
- Administration

Each feature is isolated and independently maintainable.

---

## `shared/` — Reusable Building Blocks

### Purpose

The `shared/` directory contains reusable, domain-agnostic building blocks.

This includes:

- UI primitives
- Generic hooks
- Formatting utilities
- Shared types

Shared code:

- Has no backend knowledge
- Has no auth or API assumptions
- Can be reused freely

---

## Data Fetching Strategy

### Public Data

Public data:

- Is fetched via the backend API
- Is rendered server-side when beneficial
- Is cached aggressively

This improves performance and SEO.

---

## Authenticated Data

Authenticated data:

- Is fetched client-side
- Is scoped to the logged-in user
- Is never statically generated

Authentication state is resolved before rendering protected routes.

---

## SEO Responsibilities

The web application is responsible for:

- Semantic URLs
- Metadata generation
- Open Graph and sharing previews
- Canonical links

SEO concerns are handled at the routing and layout level, not within features.

---

## Web Playback Responsibilities

The web application supports audio playback, but with different constraints than mobile.

Web playback:

- Does not support offline downloads
- Relies on streamed media
- Syncs progress when online

The same backend endpoints are used as on mobile.

---

## Differences from Mobile

The web application differs from mobile in several intentional ways:

- Emphasizes bulk workflows over quick actions
- Prioritizes discoverability over offline access
- Optimizes for keyboards and large screens
- Uses server-side rendering for public content

These differences reflect platform strengths rather than inconsistency.

---

### Security and Trust Boundaries

The web application:

- Never bypasses backend authorization
- Never embeds secrets
- Never assumes trust based on route access alone

All sensitive actions are validated by the backend.

---

## Evolution and Maintainability

The web application is designed to evolve through:

- New features
- Enhanced editorial tools
- Improved discovery mechanisms

Its structure ensures that growth remains incremental rather than disruptive.

---

## Closing Note

The web application of Salafi Durus complements the mobile experience without duplicating it.

By clearly separating public discovery from administrative power tools, and by remaining a pure client of the backend, the web application remains scalable, secure, and maintainable.

All web features must respect these structural boundaries and responsibilities.
