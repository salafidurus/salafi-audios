---
name: ui-ux-pro-max
description: |
  Comprehensive design guide for web and mobile applications. Contains 67 UI styles, 161 color
  palettes, 57 font pairings, 99 UX guidelines, and 25 chart types across 16 technology stacks.
  Searchable database with priority-based recommendations. Use when designing any UI screen,
  component, or selecting a design system (colors, typography, spacing).
---

# ui-ux-pro-max

Comprehensive design guide for web and mobile applications. Contains 67 styles, 161 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types across 16 technology stacks. Searchable database with priority-based recommendations.

## Prerequisites

Python 3 must be installed. Verify with:

```bash
python3 --version || python --version
```

## Script Location

All searches run via:

```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" [options]
```

## How to Use This Skill

Use this skill when the user requests any of the following:

| Scenario                        | Trigger Examples                                            | Start From                        |
| ------------------------------- | ----------------------------------------------------------- | --------------------------------- |
| **New project / page**          | "Build a dashboard", "Create a landing page"                | Step 1 → Step 2 (design system)   |
| **New component**               | "Create a pricing card", "Add a modal"                      | Step 3 (domain search: style, ux) |
| **Choose style / color / font** | "What style fits a fintech app?", "Recommend color palette" | Step 2 (design system)            |
| **Review existing UI**          | "Review this page for UX issues", "Check accessibility"     | Quick Reference checklist         |
| **Fix a UI bug**                | "Button hover is broken", "Layout shifts on load"           | Step 3 (domain search: ux)        |
| **Add charts / data viz**       | "Add an analytics dashboard chart"                          | Step 3 (domain: chart)            |
| **Stack best practices**        | "React Native performance tips", "Next.js navigation"       | Step 4 (stack search)             |

Follow this workflow:

### Step 1: Analyze User Requirements

Extract key information from user request:

- **Product type**: Entertainment (social, video, music, gaming), Tool (scanner, editor, converter), Productivity (task manager, notes, calendar), or hybrid
- **Target audience**: C-end consumer users; consider age group, usage context (commute, leisure, work)
- **Style keywords**: playful, vibrant, minimal, dark mode, content-first, immersive, etc.
- **Stack**: React Native (mobile) or Next.js (web) for this project

### Step 2: Generate Design System (REQUIRED)

**Always start with `--design-system`** to get comprehensive recommendations with reasoning:

```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

This command:

1. Searches domains in parallel (product, style, color, landing, typography)
2. Applies reasoning rules from `ui-reasoning.csv` to select best matches
3. Returns complete design system: pattern, style, colors, typography, effects
4. Includes anti-patterns to avoid

**Example:**

```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "islamic audio lectures mobile app" --design-system -p "Salafi Durus"
```

### Step 2b: Persist Design System (Master + Overrides Pattern)

To save the design system for hierarchical retrieval across sessions, add `--persist`:

```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name"
```

This creates:

- `design-system/MASTER.md` — Global Source of Truth with all design rules
- `design-system/pages/` — Folder for page-specific overrides

### Step 3: Supplement with Detailed Searches (as needed)

```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

| Need                  | Domain       | Example                                              |
| --------------------- | ------------ | ---------------------------------------------------- |
| Product type patterns | `product`    | `--domain product "audio streaming mobile"`          |
| More style options    | `style`      | `--domain style "dark mode minimal"`                 |
| Color palettes        | `color`      | `--domain color "religious education"`               |
| Font pairings         | `typography` | `--domain typography "clean readable"`               |
| Chart recommendations | `chart`      | `--domain chart "progress tracking"`                 |
| UX best practices     | `ux`         | `--domain ux "animation accessibility"`              |
| Landing structure     | `landing`    | `--domain landing "hero social-proof"`               |
| React Native perf     | `react`      | `--domain react "rerender memo list"`                |
| App interface a11y    | `web`        | `--domain web "accessibilityLabel touch safe-areas"` |

### Step 4: Stack Guidelines

```bash
# React Native (mobile app)
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack react-native

# Next.js (web app)
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack nextjs
```

## Search Reference

### Available Domains

| Domain       | Use For                                             |
| ------------ | --------------------------------------------------- |
| `product`    | Product type recommendations                        |
| `style`      | UI styles, colors, effects                          |
| `typography` | Font pairings, Google Fonts                         |
| `color`      | Color palettes by product type                      |
| `landing`    | Page structure, CTA strategies                      |
| `chart`      | Chart types, library recommendations                |
| `ux`         | Best practices, anti-patterns                       |
| `react`      | React/Next.js performance                           |
| `web`        | App interface guidelines (iOS/Android/React Native) |
| `icons`      | Icon recommendations                                |

### Available Stacks (installed)

| Stack           | Use For                        |
| --------------- | ------------------------------ |
| `react-native`  | Mobile app — Expo/React Native |
| `nextjs`        | Web app — Next.js App Router   |
| `react`         | General React patterns         |
| `shadcn`        | shadcn/ui component patterns   |
| `html-tailwind` | Tailwind CSS utilities         |

## Common Rules for Professional UI

### Icons & Visual Elements

- Default icon library: **Phosphor (`@phosphor-icons/react`)** or **`@expo/vector-icons`** for native.
- Never use emojis as structural icons — use vector icons only.
- Consistent stroke width within the same visual layer (1.5px or 2px).
- Filled vs Outline: one style per hierarchy level.
- Touch target minimum: **44×44pt** (iOS) / **48×48dp** (Android). Use `hitSlop` if icon is smaller.
- Icon contrast: WCAG 4.5:1 for small elements.

### Interaction (App)

| Rule                  | Do                                                  | Don't                     |
| --------------------- | --------------------------------------------------- | ------------------------- |
| **Tap feedback**      | Clear pressed feedback within 80–150ms              | No visual response on tap |
| **Animation timing**  | 150–300ms with platform-native easing               | Instant or slow (>500ms)  |
| **Touch target**      | ≥44×44pt / ≥48×48dp, expand hit area with `hitSlop` | Tiny tap targets          |
| **Gesture conflicts** | One primary gesture per region                      | Nested tap/drag conflicts |

### Light/Dark Mode

| Rule                     | Do                                     | Don't                                |
| ------------------------ | -------------------------------------- | ------------------------------------ |
| **Body text (light)**    | ≥4.5:1 contrast against light surfaces | Low-contrast gray body text          |
| **Body text (dark)**     | ≥4.5:1 primary, ≥3:1 secondary on dark | Text blending into dark background   |
| **Token-driven theming** | Semantic color tokens per theme        | Hardcoded per-screen hex values      |
| **Modal scrim**          | 40–60% black scrim                     | Weak scrim competing with foreground |

### Layout & Spacing

| Rule               | Do                                         | Don't                               |
| ------------------ | ------------------------------------------ | ----------------------------------- |
| **Safe-area**      | Respect top/bottom safe areas for fixed UI | Content under notch or gesture area |
| **8dp rhythm**     | Consistent 4/8dp spacing system            | Random spacing increments           |
| **Scroll + fixed** | Bottom/top content insets for lists        | Scroll content behind fixed bars    |

## Pre-Delivery Checklist

### Visual Quality

- [ ] No emojis as icons (use SVG/vector instead)
- [ ] All icons from a consistent icon family and style
- [ ] Semantic theme tokens used consistently (no ad-hoc hardcoded colors)

### Interaction

- [ ] All tappable elements provide clear pressed feedback
- [ ] Touch targets meet minimum size (≥44×44pt iOS, ≥48×48dp Android)
- [ ] Micro-interaction timing in 150–300ms range
- [ ] Disabled states are visually clear and non-interactive
- [ ] Screen reader focus order matches visual order

### Light/Dark Mode

- [ ] Primary text contrast ≥4.5:1 in both modes
- [ ] Secondary text contrast ≥3:1 in both modes
- [ ] Both themes tested before delivery

### Layout

- [ ] Safe areas respected for headers, tab bars, and bottom CTA bars
- [ ] Scroll content not hidden behind fixed/sticky bars
- [ ] Verified on small phone, large phone, and tablet (portrait + landscape)
- [ ] 4/8dp spacing rhythm maintained

### Accessibility

- [ ] All meaningful images/icons have accessibility labels
- [ ] Form fields have labels, hints, and clear error messages
- [ ] Color is not the only indicator of state
- [ ] Reduced motion and dynamic text size supported
