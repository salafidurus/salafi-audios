# Web E2E intent inventory

Issue #716 establishes the Bun.WebView harness and migrates the public home
smoke journey. The existing Playwright intents remain active and are assigned
to the follow-up migration slices below.

| Existing file                   | Intent coverage                                                                                                                         | Follow-up owner                                     |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `auth-callback.e2e.ts`          | loading, timeout, authentication error, and validated redirect recovery                                                                 | #717 (`auth-callback.bun.e2e.ts`)                   |
| `auth.e2e.ts`                   | sign-in rendering, social providers, anonymous account/profile/admin/legal routes                                                       | #717 (`auth.bun.e2e.ts`)                            |
| `fallback.e2e.ts`               | branded 404, Arabic/RTL, theme persistence, and public-shell recovery                                                                   | #719                                                |
| `home.e2e.ts`                   | public study landing title/header/topic navigation and removal of the legacy search control                                             | #716 (Bun.WebView equivalent)                       |
| `localized-account-flow.e2e.ts` | canonical navigation, anonymous routes, sign-out success/failure, cookie consent, Arabic/RTL, and mobile settings/library controls      | #717 account/sign-out; #719 localization/responsive |
| `my-library.e2e.ts`             | canonical/query tabs, history updates, invalid-tab fallback, anonymous state, Arabic/RTL, and narrow-screen usability                   | #718 / #719                                         |
| `navigation.e2e.ts`             | public navigation, search palette, brand/scholars/library links, titles, settings tabs/query fallback/removed alias, and mobile loading | #718                                                |
| `workspace.e2e.ts`              | signed-out search, listener/admin capability boundaries, mobile keyboard/RTL behavior, and theme preference                             | #717 authorization; #718 / #719 remaining           |

The new `home.bun.e2e.ts` preserves the meaningful home assertions through
`Bun.WebView`: non-empty document title, study header presence, exactly one
topic tablist, and absence of the removed global search control.

The #718 Bun.WebView journey in `navigation-library.bun.e2e.ts` preserves the
navigation and My Library intents. Its coverage includes public destinations,
search affordance, settings URL state, canonical library tabs, anonymous
library state, invalid-tab fallback, and both browser-history directions.
Arabic/RTL, accessibility, and narrow-screen interaction assertions remain
assigned to issue 719; authentication and capability assertions remain assigned
to issue 717.

Issue #717 preserves the authentication, callback, account/sign-out, and
authorization intents through `auth.bun.e2e.ts`, `auth-callback.bun.e2e.ts`,
`account.bun.e2e.ts`, and `authorization.bun.e2e.ts`. The original Playwright
files remain active until the complete migration removes the compatibility
suite.
