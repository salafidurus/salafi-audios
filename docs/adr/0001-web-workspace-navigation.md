# ADR 0001: Use top navigation with an explicit admin workspace

## Status

Accepted

## Context

The web client currently presents public and administrative destinations in a
sidebar. The product needs a clearer public discovery experience, while Users
with administrative access need an unmistakable way to enter administration and
return to the public application. Administrative access is capability- and
scope-aware; it is not synonymous with the `superadmin` Role.

The web client already has a shadcn foundation, RTL support, light/dark and
accent themes, and stable public and `/admin/*` routes. Reorganizing those
routes would add SEO, deep-link, and E2E risk without improving the underlying
navigation problem.

## Decision

- Use a shadcn-based top navigation as the global navigation model for the
  public workspace.
- Use a compact top bar plus a shadcn Sheet on smaller screens.
- Expose entry to the Admin workspace from the authenticated account menu when
  `hasAnyAdminAccess` is true.
- Give the Admin workspace its own contextual header/navigation and an explicit
  “Back to app” action.
- Return to the last non-admin location when available, falling back to Home.
- Filter admin destinations by the User's backend-derived capabilities; the UI
  is a convenience and not an authorization boundary.
- Reserve the shadcn Sidebar for contextual navigation or filters, such as
  settings and dense editorial workflows.
- Preserve all current URLs, API contracts, authorization checks, themes,
  localization, RTL behavior, and brand assets while replacing presentation.
- Make Home resume-first, followed by relevant discovery and recently added
  content; defer habit mechanics until they have separate product and data
  decisions.
- Make Explore a feed/catalog hybrid with topic, Scholar, content-type,
  language, and sort filters. Persist filter state until the User clears it,
  scope persistence by route, locale, and User where relevant, and provide a
  first-class clear-all action.
- Use a catalog-only command palette for Topics, Scholars, Listings, and
  related content destinations. Keep account and administrative actions in
  their dedicated controls.
- Keep Library sections as Saved and Completed tabs.
- Keep Listings, Topics, and Promotions as internal tabs within one Admin
  Content workspace.
- Make the Admin Dashboard an operational overview whose cards, activity, and
  metrics are capability-aware and backed by available API data.
- Use data tables on wide screens, reduced-column table layouts on tablets,
  and purpose-built stacked rows on narrow screens.

## Alternatives considered

### Keep the global sidebar

Rejected because it mixes discovery and editorial concerns, consumes permanent
horizontal space, and makes the public/admin boundary less explicit.

### Use one top navigation for both workspaces

Rejected because public discovery links and administrative operations have
different information architecture and user intent. A contextual admin header
is clearer and scales better as admin sections grow.

### Restrict admin entry to `superadmin`

Rejected because scoped editors and other capability holders are legitimate
administrative Users and must be able to reach the portions of the workspace
they are authorized to use.

### Reorganize or rename routes during the UI redesign

Rejected because the navigation problem is presentational; changing stable
routes would increase migration risk without adding user value.

## Consequences

The navigation layer must track public versus admin context and preserve a safe
return destination. Admin navigation must be capability-aware and tested across
listener, scoped-admin, and superadmin states. Existing custom feature
composition remains valid; shadcn primitives replace or underpin shared UI
primitives where an equivalent exists. Filter persistence must never leak state
between Users or locales, and dashboard metrics require explicit backend data
rather than placeholder values.
