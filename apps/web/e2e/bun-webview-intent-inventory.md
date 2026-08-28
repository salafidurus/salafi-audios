# Web E2E intent inventory

Issue #716 establishes the Bun.WebView harness and migrates the public home
smoke journey. Issue #719 migrates the localized, accessibility, responsive,
and fallback intents listed below; remaining Playwright intents stay active
until their assigned migration tickets complete.

| Existing file                   | Intent coverage                                                                                                                         | Follow-up owner                                   |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `auth-callback.e2e.ts`          | loading, timeout, authentication error, and validated redirect recovery                                                                 | #717                                              |
| `auth.e2e.ts`                   | sign-in rendering, social providers, anonymous account/profile/admin/legal routes                                                       | #717                                              |
| `fallback.e2e.ts`               | branded 404, Arabic/RTL, theme persistence, and public-shell recovery                                                                   | #719 (Bun migrated)                               |
| `home.e2e.ts`                   | public study landing title/header/topic navigation and removal of the legacy search control                                             | #716 (Bun.WebView equivalent)                     |
| `localized-account-flow.e2e.ts` | canonical navigation, anonymous routes, sign-out success/failure, cookie consent, Arabic/RTL, and mobile settings/library controls      | #719 (localized subset migrated)                  |
| `my-library.e2e.ts`             | canonical/query tabs, history updates, invalid-tab fallback, anonymous state, Arabic/RTL, and narrow-screen usability                   | #718 / #719 (localized subset migrated)           |
| `navigation.e2e.ts`             | public navigation, search palette, brand/scholars/library links, titles, settings tabs/query fallback/removed alias, and mobile loading | #718                                              |
| `workspace.e2e.ts`              | signed-out search, listener/admin capability boundaries, mobile keyboard/RTL behavior, and theme preference                             | #717 / #718 / #719 (mobile/theme subset migrated) |

The new `home.bun.e2e.ts` preserves the meaningful home assertions through
`Bun.WebView`: non-empty document title, study header presence, exactly one
topic tablist, and absence of the removed global search control.

The new `localized-accessibility.bun.e2e.ts` preserves the #719 slice through
`Bun.WebView`: English and Arabic semantic content, RTL direction, keyboard
focusability, narrow-screen Settings/My Library controls, branded 404 recovery,
shell-unavailable recovery, and stored fallback theme behavior. Assertions that
remain owned by #717 or #718 are intentionally not duplicated here.
