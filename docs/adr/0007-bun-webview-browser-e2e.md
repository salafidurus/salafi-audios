# ADR 0007: Use Bun.WebView for web browser E2E

## Status

Accepted

## Context

The web application needs browser journeys at the production-built Next.js
boundary. The former Playwright suite coupled browser control, test execution,
browser binaries, retries, fixtures, and CI setup to a separate automation
platform. Those tests remain evidence of product intent, but their browser
library APIs are not product contracts.

## Decision

- Use native `Bun.WebView` as the sole browser-control platform for web browser
  E2E journeys.
- Use `bun:test` for journey orchestration and assertions.
- Keep the browser harness repository-owned and application-specific. It owns
  production server startup, readiness, configured ports, isolated browser
  profiles, explicit application-condition waits, cleanup, and failure
  diagnostics.
- Assert external behavior through visible content, semantic controls, URL and
  history state, locale/direction, supported responsive states, and recovery
  outcomes. Do not expose generic `page`, `locator`, fixture, or assertion
  compatibility APIs.
- Capture the failed test identity, current URL, screenshot, DOM snapshot, and
  browser console output before closing the failed journey.
- Treat Chromium as the supported browser boundary. Firefox and WebKit are not
  implied by this decision.

## Operational boundary

`Bun.WebView` is experimental and its runtime API may change with Bun upgrades.
The repository pins Bun through `packageManager` and `.bun-version`; upgrades
must revalidate the browser journeys and harness contract.

On Linux, Bun.WebView requires an installed Chrome-family executable such as
Chrome, Chromium, Edge, or Brave. CI must expose that prerequisite
deterministically. The web E2E command runs against a production build and
uses `BUN_E2E_PORT`, `BUN_E2E_API_ORIGIN`, and
`BUN_E2E_READY_TIMEOUT_MS` for isolated execution.

## Consequences

Browser tests communicate product intent without preserving Playwright's
auto-waiting or compatibility model. Explicit bounded waits make timing
assumptions visible, while isolated profiles prevent cookies and storage from
leaking between journeys. Failure artifacts are intentionally diagnostic, not
a replayable trace or full network-inspection system.

Web unit tests continue to use their existing DOM setup, and API E2E tests
continue to use their existing API setup. This ADR does not change product,
route, authorization, or API contracts.
