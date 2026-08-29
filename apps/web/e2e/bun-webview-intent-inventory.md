# Web E2E intent inventory

Issue #716 establishes the Bun.WebView harness and migrates the public home
smoke journey. Issue #719 migrates the localized, accessibility, responsive,
and fallback intents listed below. The Bun.WebView journeys are now the
authoritative web browser E2E path.

| Bun journey                          | Intent coverage                                                                                     | Follow-up owner |
| ------------------------------------ | --------------------------------------------------------------------------------------------------- | --------------- |
| `auth-callback.bun.e2e.ts`           | loading, timeout, authentication error, and validated redirect recovery                             | #717            |
| `auth.bun.e2e.ts`                    | sign-in rendering, social providers, anonymous account/profile/admin/legal routes                   | #717            |
| `localized-accessibility.bun.e2e.ts` | branded 404, Arabic/RTL, theme persistence, public-shell recovery, and responsive accessibility     | #719            |
| `home.bun.e2e.ts`                    | public study landing title/header/topic navigation and removal of the legacy search control         | #716            |
| `account.bun.e2e.ts`                 | canonical navigation and sign-out success/failure                                                   | #717            |
| `navigation-library.bun.e2e.ts`      | canonical/query tabs, history updates, invalid-tab fallback, anonymous state, and public navigation | #718            |
| `authorization.bun.e2e.ts`           | listener, scoped-admin, and superadmin capability boundaries                                        | #717            |

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
`e2e/journeys/`.
