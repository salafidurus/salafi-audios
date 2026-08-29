# Web E2E intent inventory

Issue #716 establishes the Bun.WebView harness and migrates the public home
smoke journey. Issue #719 migrates the localized, accessibility, responsive,
and fallback intents listed below. The Bun.WebView journeys are now the
authoritative web browser E2E path.

The migration audit below classifies the former Playwright files by their
meaningful assertions. A row is marked **preserved** when the current journey
keeps the same external contract, **strengthened** when it uses a more direct
application assertion, and **intentionally removed** when the old assertion
only proved a browser-library or migration-specific detail.

| Former source                   | Current Bun journey                                                                         | Classification and externally observable contract                                                                                                                                                                                                                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `home.e2e.ts`                   | `home.bun.e2e.ts`                                                                           | **Preserved:** non-empty title, stable study header, topic tablist, and absence of the removed global search control. API stubbing was removed because the journey now uses the production-built app and the stable landing contract.                                                                                                                            |
| `navigation.e2e.ts`             | `navigation-library.bun.e2e.ts`, `localized-accessibility.bun.e2e.ts`                       | **Preserved/strengthened:** public destinations, search affordance, settings query state, invalid-tab fallback, removed profile alias, narrow viewport, and no client errors. Pointer-specific locator steps were replaced by direct URL/history and semantic DOM outcomes; command-palette mechanics are intentionally covered by web unit tests.               |
| `my-library.e2e.ts`             | `navigation-library.bun.e2e.ts`, `localized-accessibility.bun.e2e.ts`                       | **Preserved:** canonical Started, Saved, and Completed states, URL/query state, anonymous state, invalid-tab fallback, browser history, Arabic/RTL rendering, and narrow-screen tab usability.                                                                                                                                                                   |
| `auth.e2e.ts`                   | `auth.bun.e2e.ts`                                                                           | **Preserved:** sign-in heading and providers, auth-optional account/profile/legal routes, and anonymous admin redirect. Assertions remain at the visible route and URL boundary.                                                                                                                                                                                 |
| `auth-callback.e2e.ts`          | `auth-callback.bun.e2e.ts`                                                                  | **Preserved:** loading shell, timeout recovery, provider error recovery, safe relative redirect, and external redirect fallback. Request interception is application-specific fixture setup, not a generic browser abstraction.                                                                                                                                  |
| `localized-account-flow.e2e.ts` | `account.bun.e2e.ts`, `localized-accessibility.bun.e2e.ts`, `navigation-library.bun.e2e.ts` | **Preserved:** account/profile navigation, sign-out success and failure, localized settings, personal-route boundaries, legacy aliases, responsive controls, and Arabic/RTL outcomes. Cookie-consent storage/banner transitions are intentionally covered by legal unit/component tests. Assertions are distributed by journey ownership rather than duplicated. |
| `fallback.e2e.ts`               | `localized-accessibility.bun.e2e.ts`                                                        | **Preserved:** branded not-found status/content, Arabic/RTL fallback, stored theme, and shell-unavailable recovery. The current journey retains the two fallback tiers defined by ADR 0005.                                                                                                                                                                      |
| `workspace.e2e.ts`              | `authorization.bun.e2e.ts`, `localized-accessibility.bun.e2e.ts`                            | **Preserved:** listener/scoped-admin/superadmin capability visibility, public/admin workspace navigation, keyboard-reachable compact navigation, RTL, and theme preference. Command-palette interaction is represented only where it remains a supported critical journey.                                                                                       |

The following current journeys are the authoritative ownership map:

| Bun journey                          | Owned contract                                                                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `auth-callback.bun.e2e.ts`           | Callback loading, timeout/error recovery, safe redirects, and external-destination fallback.                                           |
| `auth.bun.e2e.ts`                    | Sign-in rendering and anonymous route authorization boundaries.                                                                        |
| `localized-accessibility.bun.e2e.ts` | English/Arabic presentation, RTL, keyboard focus, responsive controls, theme persistence, branded 404, and shell-unavailable recovery. |
| `home.bun.e2e.ts`                    | Public study landing title/header/topic navigation and legacy search-control removal.                                                  |
| `account.bun.e2e.ts`                 | Account/profile navigation and sign-out success/failure.                                                                               |
| `navigation-library.bun.e2e.ts`      | Public navigation, settings/library URL state, library tabs, anonymous state, invalid-tab fallback, and browser history.               |
| `authorization.bun.e2e.ts`           | Listener, scoped-admin, and superadmin capability boundaries.                                                                          |

Two legacy assertions are intentionally owned outside the browser journey
suite. The command palette's open, focus, filtering, and selection mechanics
remain covered by web unit tests in
`src/features/navigation/components/command-palette/command-palette.spec.tsx`;
the browser journey preserves the user-visible search affordance. Cookie
consent storage and banner transitions remain covered by the legal hook and
component tests in `src/features/legal/`; they are not repeated in a browser
journey because analytics/consent side effects are explicitly outside the
public-shell E2E boundary. These are intentional removals from browser E2E,
not unclassified coverage.

The new `home.bun.e2e.ts` preserves the meaningful home assertions through
`Bun.WebView`: non-empty document title, study header presence, exactly one
topic tablist, and absence of the removed global search control.

The new `localized-accessibility.bun.e2e.ts` preserves the #719 slice through
`Bun.WebView`: English and Arabic semantic content, RTL direction, keyboard
focusability, narrow-screen Settings/My Library controls, branded 404 recovery,
shell-unavailable recovery, and stored fallback theme behavior. Assertions that
remain owned by #717 or #718 are intentionally not duplicated here.

The #718 Bun.WebView journey in `navigation-library.bun.e2e.ts` preserves the
navigation and My Library intents. Its coverage includes public destinations,
search affordance, settings URL state, canonical library tabs, anonymous
library state, invalid-tab fallback, and both browser-history directions.
Arabic/RTL, accessibility, and narrow-screen interaction assertions remain
assigned to issue 719; authentication and capability assertions remain assigned
to issue 717.

Issue #717 preserves the authentication, callback, account/sign-out, and
authorization intents through the corresponding journeys under
`e2e/journeys/`. No current browser intent is deferred by this inventory.
