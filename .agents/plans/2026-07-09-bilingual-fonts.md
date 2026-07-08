# Bilingual Font Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire Arabic fonts (Alexandria for display, IBM Plex Sans Arabic for body) into web and native apps alongside existing English fonts, without using variable fonts.

**Architecture:** CSS `:lang(ar)` variable aliasing for web (no JS locale branching); locale-aware `createTypography()` for native with `UnistylesRuntime.updateTheme` at init time. App reloads on RTL locale switch, so typography sync is one-time per session.

**Tech Stack:** `next/font/local` (web), `expo-font` (native), `react-native-unistyles` (native theming), CSS custom properties (web), i18next locale detection.

## Global Constraints

- Static fonts only (no variable/weight-axis fonts)
- Mono font (GeistMono) stays shared across locales
- Tests co-located with source files, no `__tests__/` directory
- Named exports only (no default exports except where Next.js App Router requires)
- TDD: write failing test first, then implement, then verify all tests pass
- All font files already exist in both `apps/web/public/fonts/` and `apps/native/assets/fonts/`

---

### Task 1: Wire Arabic fonts into web via `next/font/local` + CSS `:lang(ar)`

**Files:**

- Modify: `apps/web/src/app/layout.tsx` — rename existing font CSS variables, add Arabic font declarations
- Modify: `apps/web/src/app/globals.css` — add `:root`/`:lang(ar)` variable aliases so existing `var(--font-display)` and `var(--font-body)` resolve to locale-appropriate font stacks

**Interfaces:**

- Consumes: existing `next/font/local` pattern, existing `webFontFamily` references (unchanged)
- Produces: CSS variable aliases `--font-display` and `--font-body` that resolve to English or Arabic fonts via `:lang(ar)` selector

- [ ] **Step 1: Read current files for baseline**

Read:

- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/core/styles/theme/typography.ts`

- [ ] **Step 2: Rename existing font variables and add Arabic declarations in `layout.tsx`**

In `apps/web/src/app/layout.tsx`:

1. Rename Fraunces `variable: "--font-display"` → `"--font-display-en"`
2. Rename Manrope `variable: "--font-body"` → `"--font-body-en"`
3. Add Alexandria `localFont()` block:

```typescript
const alexandria = localFont({
  variable: "--font-display-ar",
  display: "swap",
  src: [
    { path: "../../public/fonts/Alexandria-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Alexandria-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Alexandria-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Alexandria-Bold.ttf", weight: "700", style: "normal" },
  ],
});
```

4. Add IBMPlexSansArabic `localFont()` block:

```typescript
const ibmPlexSansArabic = localFont({
  variable: "--font-body-ar",
  display: "swap",
  src: [
    { path: "../../public/fonts/IBMPlexSansArabic-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/IBMPlexSansArabic-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/IBMPlexSansArabic-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/IBMPlexSansArabic-Bold.ttf", weight: "700", style: "normal" },
  ],
});
```

5. Update `<html>` className to include all 5 font variables:

```tsx
className={`${fraunces.variable} ${manrope.variable} ${geistMono.variable} ${alexandria.variable} ${ibmPlexSansArabic.variable}`}
```

- [ ] **Step 3: Add CSS variable aliases in `globals.css`**

After the `:root` block (after line 44), add:

```css
:root {
  --font-display: var(--font-display-en), serif;
  --font-body: var(--font-body-en), sans-serif;
}
:root:lang(ar) {
  --font-display: var(--font-display-ar), serif;
  --font-body: var(--font-body-ar), sans-serif;
}
```

Note: `:root:lang(ar)` equals `:lang(ar)` in specificity on `<html>` but ensures the rule applies to the root element only.

- [ ] **Step 4: Verify**

1. Check that body font reference in `globals.css` (`font-family: var(--font-body), sans-serif;`) correctly resolves through the alias — no change needed, it already uses `var(--font-body)`
2. Check that `webFontFamily` references in `typography.ts` correctly resolve — no change needed, they already use `var(--font-display)`, `var(--font-body)`, `var(--font-mono)`
3. Check that `theme-css.ts` typography variables reference the same CSS vars — no change needed

Run: `bun run --filter web typecheck`

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/layout.tsx apps/web/src/app/globals.css
git commit -m "feat(web): add Arabic font switching via CSS :lang(ar)"
```

---

### Task 2: Add Arabic fonts to native font loading

**Files:**

- Modify: `apps/native/src/core/providers.tsx` — add 8 `require()` calls for Arabic fonts in `AppFontsProvider`

**Interfaces:**

- Consumes: `useFonts()` from `expo-font`
- Produces: Arabic font families available in native bundle

- [ ] **Step 1: Read current providers.tsx**

Read `apps/native/src/core/providers.tsx`.

- [ ] **Step 2: Add Arabic font entries to `useFonts()`**

In `AppFontsProvider`, add to the `useFonts()` object:

```typescript
"Alexandria-Regular": require("../../assets/fonts/Alexandria-Regular.ttf"),
"Alexandria-Medium": require("../../assets/fonts/Alexandria-Medium.ttf"),
"Alexandria-SemiBold": require("../../assets/fonts/Alexandria-SemiBold.ttf"),
"Alexandria-Bold": require("../../assets/fonts/Alexandria-Bold.ttf"),
"IBMPlexSansArabic-Regular": require("../../assets/fonts/IBMPlexSansArabic-Regular.ttf"),
"IBMPlexSansArabic-Medium": require("../../assets/fonts/IBMPlexSansArabic-Medium.ttf"),
"IBMPlexSansArabic-SemiBold": require("../../assets/fonts/IBMPlexSansArabic-SemiBold.ttf"),
"IBMPlexSansArabic-Bold": require("../../assets/fonts/IBMPlexSansArabic-Bold.ttf"),
```

- [ ] **Step 3: Run typecheck**

Run: `bun run --filter native typecheck`

- [ ] **Step 4: Commit**

```bash
git add apps/native/src/core/providers.tsx
git commit -m "feat(native): register Arabic fonts in expo-font loader"
```

---

### Task 3: Refactor native typography for locale awareness

**Files:**

- Modify: `apps/native/src/core/styles/theme/typography.ts` — factor `mobileFontFamily` into locale-specific maps, `createTypographyNative()` accepts `locale` parameter
- Create: `apps/native/src/core/styles/theme/typography.spec.ts` — unit tests for locale-specific typography

**Interfaces:**

- Consumes: `typographyBase` from `@sd/design-tokens`, `getWeightKey` helper
- Produces: `createTypography(locale: "en" | "ar"): TypographyNative` function, exports both `typographyEn` and `typographyAr` static objects

- [ ] **Step 1: Write the failing test**

Create `apps/native/src/core/styles/theme/typography.spec.ts`:

```typescript
import { createTypography } from "./typography";

describe("createTypography", () => {
  it("uses Fraunces for English display role", () => {
    const typo = createTypography("en");
    expect(typo.displayLg.fontFamily).toBe("Fraunces-SemiBold");
    expect(typo.displayMd.fontFamily).toBe("Fraunces-SemiBold");
  });

  it("uses Manrope for English body role", () => {
    const typo = createTypography("en");
    expect(typo.bodyMd.fontFamily).toBe("Manrope-Regular");
    expect(typo.titleLg.fontFamily).toBe("Manrope-SemiBold");
    expect(typo.caption.fontFamily).toBe("Manrope-Regular");
  });

  it("uses GeistMono for mono role regardless of locale", () => {
    const enTypo = createTypography("en");
    const arTypo = createTypography("ar");
    expect(enTypo.bodyMd.fontFamily).not.toBe("Fraunces");
    expect(arTypo.bodyMd.fontFamily).not.toBe("Fraunces");
  });

  it("uses Alexandria for Arabic display role", () => {
    const typo = createTypography("ar");
    expect(typo.displayLg.fontFamily).toBe("Alexandria-SemiBold");
    expect(typo.displayMd.fontFamily).toBe("Alexandria-SemiBold");
  });

  it("uses IBM Plex Sans Arabic for Arabic body role", () => {
    const typo = createTypography("ar");
    expect(typo.bodyMd.fontFamily).toBe("IBMPlexSansArabic-Regular");
    expect(typo.titleLg.fontFamily).toBe("IBMPlexSansArabic-SemiBold");
  });

  it("preserves font geometry across locales", () => {
    const enTypo = createTypography("en");
    const arTypo = createTypography("ar");
    expect(arTypo.bodyMd.fontSize).toBe(enTypo.bodyMd.fontSize);
    expect(arTypo.displayLg.lineHeight).toBe(enTypo.displayLg.lineHeight);
    expect(arTypo.titleMd.fontWeight).toBe(enTypo.titleMd.fontWeight);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run --filter native test -- src/core/styles/theme/typography.spec.ts`
Expected: FAIL — `createTypography` not exported, `mobileFontFamily` object doesn't have locale structure

- [ ] **Step 3: Implement locale-aware typography**

In `apps/native/src/core/styles/theme/typography.ts`:

Replace the single `mobileFontFamily` with locale-specific maps:

```typescript
const fontFamilies = {
  en: {
    display: {
      regular: "Fraunces-Regular",
      medium: "Fraunces-SemiBold",
      semibold: "Fraunces-SemiBold",
      bold: "Fraunces-Bold",
    },
    body: {
      regular: "Manrope-Regular",
      medium: "Manrope-Medium",
      semibold: "Manrope-SemiBold",
      bold: "Manrope-Bold",
    },
  },
  ar: {
    display: {
      regular: "Alexandria-Regular",
      medium: "Alexandria-Medium",
      semibold: "Alexandria-SemiBold",
      bold: "Alexandria-Bold",
    },
    body: {
      regular: "IBMPlexSansArabic-Regular",
      medium: "IBMPlexSansArabic-Medium",
      semibold: "IBMPlexSansArabic-SemiBold",
      bold: "IBMPlexSansArabic-Bold",
    },
  },
} as const;

const monoFamily = {
  regular: "GeistMono-Regular",
  medium: "GeistMono-Medium",
  semibold: "GeistMono-SemiBold",
  bold: "GeistMono-Bold",
} as const;

type Locale = "en" | "ar";
```

Replace `getNativeFontFamily` to accept locale:

```typescript
const getNativeFontFamily = (
  locale: Locale,
  role: "display" | "body" | "mono",
  weightKey: "regular" | "medium" | "semibold" | "bold",
): string => {
  if (role === "mono") {
    return monoFamily[weightKey];
  }
  return fontFamilies[locale][role][weightKey];
};
```

Replace `createTypographyNative` to accept locale:

```typescript
export const createTypography = (locale: Locale = "en"): TypographyNative => {
  return Object.fromEntries(
    Object.entries(typographyBase).map(([variant, token]) => {
      const weightKey = getWeightKey(token.fontWeight);
      return [
        variant,
        {
          fontFamily: getNativeFontFamily(locale, token.fontRole, weightKey),
          fontSize: token.fontSize.mobile,
          lineHeight: token.lineHeight.mobile,
          letterSpacing: token.letterSpacing.mobile,
        },
      ];
    }),
  ) as TypographyNative;
};
```

Keep backward-compatible exports:

```typescript
export const typographyNative = createTypography("en");
export const typographyArabic = createTypography("ar");
```

Remove the inner switch-based `getNativeFontFamily` (replaced with direct object lookup).

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run --filter native test -- src/core/styles/theme/typography.spec.ts`
Expected: PASS

- [ ] **Step 5: Update imports in dependent files**

In `apps/native/src/core/styles/theme/index.ts`, update the import:

```typescript
import { typographyNative, type TypographyNative } from "./typography";
```

This import stays the same (default is English). The `createThemeNative` and type exports remain unchanged.

- [ ] **Step 6: Run typecheck**

Run: `bun run --filter native typecheck`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add apps/native/src/core/styles/theme/typography.ts apps/native/src/core/styles/theme/typography.spec.ts apps/native/src/core/styles/theme/index.ts
git commit -m "feat(native): locale-aware typography with Arabic font selection"
```

---

### Task 4: Sync locale-aware typography into native app init

**Files:**

- Modify: `apps/native/src/core/providers.tsx` — after i18n init, call `UnistylesRuntime.updateTheme` to apply locale-appropriate typography to both light and dark themes
- Create: `apps/native/src/core/styles/theme/typography-sync.spec.ts` — test the sync function

**Interfaces:**

- Consumes: `UnistylesRuntime.updateTheme`, `createTypography` from typography module, `i18n.language` from react-i18next
- Produces: typography in both light/dark themes matches the active locale

- [ ] **Step 1: Write the failing test**

Create `apps/native/src/core/styles/theme/typography-sync.spec.ts`:

```typescript
import { syncTypographyToLocale } from "./typography-sync";
import { UnistylesRuntime } from "react-native-unistyles";

jest.mock("react-native-unistyles", () => ({
  UnistylesRuntime: {
    updateTheme: jest.fn(),
  },
}));

describe("syncTypographyToLocale", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls updateTheme for light and dark themes", () => {
    syncTypographyToLocale("en");
    expect(UnistylesRuntime.updateTheme).toHaveBeenCalledTimes(2);
  });

  it("passes correct locale to theme updater for English", () => {
    syncTypographyToLocale("en");
    const [, , updater] = (UnistylesRuntime.updateTheme as jest.Mock).mock.calls[0];

    const result = updater({} as any);
    expect(result.typography.displayLg.fontFamily).toBe("Fraunces-SemiBold");
  });

  it("passes correct locale to theme updater for Arabic", () => {
    syncTypographyToLocale("ar");
    const [, , updater] = (UnistylesRuntime.updateTheme as jest.Mock).mock.calls[0];

    const result = updater({} as any);
    expect(result.typography.displayLg.fontFamily).toBe("Alexandria-SemiBold");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run --filter native test -- src/core/styles/theme/typography-sync.spec.ts`
Expected: FAIL — `typography-sync` module doesn't exist

- [ ] **Step 3: Implement the sync function**

Create `apps/native/src/core/styles/theme/typography-sync.ts`:

```typescript
import { UnistylesRuntime } from "react-native-unistyles";
import { createTypography } from "./typography";

type Locale = "en" | "ar";

export function syncTypographyToLocale(locale: Locale): void {
  const typography = createTypography(locale);

  UnistylesRuntime.updateTheme("light", (current) => ({
    ...current,
    typography,
  }));

  UnistylesRuntime.updateTheme("dark", (current) => ({
    ...current,
    typography,
  }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run --filter native test -- src/core/styles/theme/typography-sync.spec.ts`
Expected: PASS

- [ ] **Step 5: Wire sync into app initialization**

In `apps/native/src/core/providers.tsx`:

1. Add import:

```typescript
import { syncTypographyToLocale } from "../core/styles/theme/typography-sync";
```

Wait — `providers.tsx` is in `src/core/`, so relative path would be `./styles/theme/typography-sync`. Let me verify: providers is at `apps/native/src/core/providers.tsx`, so `./styles/theme/typography-sync` is correct.

2. After `initI18n()` succeeds and locale is determined, call `syncTypographyToLocale`:

In the `useEffect` that initializes i18n (lines 78-85), modify the success handler:

```typescript
useEffect(() => {
  void initI18n()
    .then(() => {
      setI18nReady(true);
      const locale = (i18n.language === "ar" ? "ar" : "en") as "en" | "ar";
      syncTypographyToLocale(locale);
    })
    .catch((err) => {
      console.warn("[i18n] init failed, falling back to default:", err);
      setI18nReady(true);
    });
}, []);
```

- [ ] **Step 6: Run typecheck and all tests**

Run: `bun run --filter native typecheck`
Run: `bun run --filter native test`
Expected: Both PASS

- [ ] **Step 7: Commit**

```bash
git add apps/native/src/core/providers.tsx apps/native/src/core/styles/theme/typography-sync.ts apps/native/src/core/styles/theme/typography-sync.spec.ts
git commit -m "feat(native): sync locale typography via UnistylesRuntime.updateTheme"
```

---

### Task 5: Final verification

- [ ] **Step 1: Run full monorepo typecheck**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 2: Run full monorepo test suite**

Run: `bun run test`
Expected: PASS (no regressions)

- [ ] **Step 3: Run lint**

Run: `bun run lint`
Expected: PASS

- [ ] **Step 4: Run web build**

Run: `bun run --filter web build`
Expected: PASS (verifies Arabic fonts are bundled by `next/font/local`)

---

## Plan Completion

Mark `Completed` when:

- All 5 tasks are done with passing tests
- `bun run typecheck`, `bun run test`, `bun run lint` all pass
- `bun run --filter web build` succeeds
- Arabic fonts render correctly when the app language is set to Arabic
