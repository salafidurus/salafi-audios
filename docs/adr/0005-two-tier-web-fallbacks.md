# ADR 0005: Use two tiers for web fallback rendering

## Status

Accepted

## Context

The web application has two different failure boundaries. A normal missing route
still has the root document, providers, localization bootstrap, and theme
bootstrap available. A failure while rendering the public shell may remove those
normal application dependencies from the safe recovery path.

Using the full consent layout for every fallback would mount unrelated behavior
such as analytics, cookie consent, and the mini-player. Using a root fallback
without public navigation removes orientation and recovery links.

## Decision

Use two explicitly separate fallback tiers:

- The **normal not-found state** renders the existing branded 404 content inside
  the reusable **public shell**, composed of public navigation, fallback content,
  and the public footer. It retains normal localization, RTL, theme, keyboard,
  and 404 response behavior without consent-layout side effects.
- The **shell-unavailable fallback** is a later, deliberately minimal recovery
  boundary. It must not depend on public navigation, the footer, auth, API data,
  runtime translation hooks, client routing, or application providers.

The normal consent layout may add its own mini-player and consent/analytics
behavior around the reusable public shell. Those additions are not part of the
normal fallback shell.

## Consequences

Fallback behavior remains branded and recoverable without making the root
document depend on the full authenticated/consent composition. The two tiers
must be tested independently so a future shell change cannot remove the final
emergency recovery path.
