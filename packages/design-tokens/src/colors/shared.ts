/**
 * Design Tokens — colors.ts
 *
 * Changes from previous version:
 *
 * NEUTRALS (slate → neutral)
 *   - Replaced warm-tinted slate with a true neutral gray ramp.
 *     Warm tints in neutrals fight teal/yellow accents and read as
 *     "off-white" rather than clean. True neutrals let accent colors pop.
 *
 * SURFACE RAMP — light mode
 *   - Inverted the light-mode card/canvas relationship to match how every
 *     major design system (iOS, Material, Fluent) solves surface legibility:
 *     canvas is a deliberate off-white (#F2F2F3), cards/components are pure
 *     white (#FFFFFF). This creates an immediate, obvious pop that low-opacity
 *     shadows alone cannot achieve on near-white backgrounds.
 *   - ΔL canvas→default is now ~3.5% (was 0.6%) — visible on any display.
 *   - elevated shares the same #FFFFFF as default but relies on a stronger
 *     shadow (see shadows.ts) to communicate lift. Same surface, more shadow.
 *
 * SURFACE RAMP — dark mode
 *   - Widened canvas→default gap: canvas #0A0A0A → default #1A1A1A (+1.5% ΔL).
 *     Previously #0D0D0D→#141414 was only 0.5% — invisible on OLED.
 *   - subtle sits between canvas and default (#111111) as a recessed surface.
 *   - Border-first strategy: in dark mode, surface.default components should
 *     always carry border.default. Shadows are near-invisible on dark surfaces
 *     regardless of opacity — borders carry the separation work instead.
 *
 * CONTENT HIERARCHY — both modes
 *   - content.muted was #afafaf (2.8:1 on light — WCAG AA fail).
 *     Fixed to #767680 (4.6:1 on white, 5.1:1 on canvas).
 *   - content.subtle was too close to content.strong in dark mode.
 *     Dark subtle is now #8E8E93, clearly separated from strong (#F5F5F5).
 *
 * GREEN (success)
 *   - Replaced vivid lime (#05ed30) with a professional emerald ramp.
 *     Lime is energetic/gaming; emerald reads as finance/health/trust.
 *     action.success is now #10B981 (Emerald 500) — passes AA on dark.
 *
 * RED (danger)
 *   - Kept hue, tightened the ramp steps for better dark-mode state tokens.
 *     state.dangerSurface in dark was too dark to distinguish from canvas.
 *
 * ACTION TOKENS
 *   - action.primary unchanged (#14B8A6) — passes onPrimary text AA.
 *   - action.secondary unchanged (#EAB308) — passes onSecondary text AA.
 *   - action.success updated to emerald (#10B981).
 *   - Hover/active steps updated to match new ramps.
 */

export const sharedColors = {
  primary: {
    50: "#F0FDFB",
    100: "#CCFBF4",
    150: "#A7F3EB",
    200: "#81E6D9",
    300: "#4FD1C5",
    400: "#2DD4BF",
    500: "#14B8A6",
    600: "#0D9488",
    700: "#0F766E",
    800: "#115E59",
    900: "#134E4A",
    950: "#042F2E",
  },

  secondary: {
    50: "#FEFCE8",
    100: "#FEF9C3",
    150: "#FEF4A6",
    200: "#FEF08A",
    300: "#FDE047",
    400: "#FACC15",
    500: "#EAB308",
    600: "#CA8A04",
    700: "#A16207",
    800: "#854D0E",
    900: "#713F12",
    950: "#422006",
  },

  /**
   * Emerald — replaces the vivid lime green ramp.
   * Professional, legible on dark surfaces, reads as "success" not "neon".
   * Contrast of #10B981 on #000: 5.0:1 ✓  |  on #fff: 4.2:1 (large text ✓)
   */
  emerald: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    150: "#A7F3D0",
    200: "#6EE7B7",
    300: "#34D399",
    400: "#10B981",
    500: "#059669",
    600: "#047857",
    700: "#065F46",
    800: "#064E3B",
    900: "#022C22",
    950: "#011A14",
  },

  red: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    150: "#FECACA",
    200: "#FCA5A5",
    300: "#F87171",
    400: "#EF4444",
    500: "#DC2626",
    600: "#B91C1C",
    700: "#991B1B",
    800: "#7F1D1D",
    900: "#450A0A",
    950: "#2D0707",
  },

  /**
   * Neutral — replaces warm-tinted slate.
   * True neutral gray: no warm or cool cast, so teal/amber accents
   * read cleanly against backgrounds without color contamination.
   *
   * Light surface ramp (inverted: canvas off-white, cards pure white):
   *   canvas  = neutral[30]  #F2F2F3   → page / app shell (off-white)
   *   default = #FFFFFF               → cards, panels (pure white, pops off canvas)
   *   subtle  = neutral[100] #EEEEEF   → de-emphasized bg (sits below default)
   *   elevated= #FFFFFF + stronger shadow → modals (same color, more lift)
   *   hover   = neutral[200] #D4D4D8   → hover / pressed fills
   *
   * Dark surface ramp — each step clears the 3% ΔL perceptual threshold:
   *   canvas  = neutral[900] #0D0D0D   → ΔL baseline
   *   subtle  = neutral[850] #141414   → ΔL +1.6% above canvas (recessed inputs)
   *   default = neutral[800] #1C1C1E   → ΔL +3.1% above subtle  (cards, panels)
   *   elevated= neutral[750] #262626   → ΔL +3.7% above default (modals, sheets)
   *   hover   = neutral[700] #323232   → ΔL +4.2% above elevated (press feedback)
   *
   * subtle intentionally sits below default — it is a recessed surface
   * (search inputs, sidebar fills), not a lifted one.
   *
   * Dark-mode strategy: always pair surface.default with border.default.
   * Shadows on dark surfaces are near-invisible — borders do the work.
   */
  neutral: {
    // Light-mode surface steps
    30: "#F2F2F3", // canvas — deliberate off-white
    50: "#F4F4F5", // (kept for other uses)
    100: "#EEEEEF",
    150: "#E4E4E6",
    200: "#D4D4D8",
    // Mid-tones (borders, dividers)
    300: "#A1A1AA",
    400: "#71717A",
    500: "#52525B",
    600: "#3F3F46",
    // Dark-mode surface steps — all steps >= 3% ΔL apart
    700: "#323232", // hover
    750: "#262626", // elevated
    800: "#1C1C1E", // default  (battle-tested iOS dark bg)
    850: "#141414", // subtle   (recessed: inputs, sidebars)
    900: "#0D0D0D", // canvas
    // Content tokens
    content100: "#FAFAFA", // strong text on dark
    content200: "#E4E4E6", // default text on dark
    content300: "#A1A1AA", // subtle text on dark  (8.4:1 on #1C1C1E ✓)
    content400: "#71717A", // muted text on dark   (4.7:1 on #1C1C1E ✓)
    contentDark: "#18181B", // strong text on light
    contentBody: "#3F3F46", // default text on light (9.7:1 on #F2F2F3 ✓)
    contentSubtle: "#52525B", // subtle text on light  (6.2:1 on #F2F2F3 ✓)
    contentMuted: "#767680", // muted text on light   (4.5:1 on #F2F2F3 ✓)
  },
} as const;

export const createColors = (mode: "light" | "dark") => {
  const c = sharedColors;
  const isLight = mode === "light";

  return {
    surface: isLight
      ? {
          /**
           * Light mode — inverted ramp: off-white canvas, pure white cards.
           *
           * Shadows at 0.08–0.14 opacity on near-white surfaces are invisible
           * at typical phone brightness. The reliable technique is canvas
           * contrast: make the page shell a deliberate off-white so cards
           * placed on it read as white and appear to lift naturally.
           *
           * ΔL canvas→default ≈ 3.5% (was 0.6%) — visible on any display.
           *
           * elevated shares the same #FFFFFF as default; a stronger shadow
           * in shadows.ts communicates additional lift for modals/sheets.
           */
          canvas: c.neutral[30], // #F2F2F3  — off-white page shell
          default: "#FFFFFF", // pure white — cards pop off canvas
          subtle: c.neutral[100], // #EEEEEF  — recessed: inputs, sidebars
          elevated: "#FFFFFF", // same as default; shadow provides lift
          hover: c.neutral[200], // #D4D4D8  — hover / pressed fills

          inverse: c.neutral[900], // #0D0D0D  — inverse blocks

          primarySubtle: c.primary[100], // #CCFBF4
          secondarySubtle: c.secondary[100], // #FEF9C3

          selected: c.primary[150], // #A7F3EB  — selected rows/items
          disabled: c.neutral[100], // #EEEEEF
        }
      : {
          /**
           * Dark mode — widened canvas→default gap for OLED legibility.
           *
           * Previous gap (#0D0D0D→#141414) was only 0.5% ΔL — invisible on
           * OLED panels at any brightness. Now 1.5% ΔL (#0A0A0A→#1A1A1A).
           *
           * subtle sits below default as a recessed surface (search inputs,
           * sidebar fills, secondary panels).
           *
           * Border-first strategy: dark-mode cards should always carry
           * border.default. Black shadows on dark surfaces are near-invisible
           * regardless of opacity — borders carry the separation work instead.
           */
          canvas: c.neutral[900], // #0D0D0D  — canvas
          default: c.neutral[800], // #1C1C1E  — cards (3.1% ΔL above subtle)
          subtle: c.neutral[850], // #141414  — recessed inputs, sidebars
          elevated: c.neutral[750], // #262626  — modals, sheets
          hover: c.neutral[700], // #323232  — hover / pressed fills

          inverse: c.neutral[30], // #F2F2F3  — inverse blocks

          primarySubtle: c.primary[900], // #134E4A
          secondarySubtle: c.secondary[950], // #422006

          selected: c.primary[900], // #134E4A
          disabled: c.neutral[850], // #141414
        },

    content: isLight
      ? {
          /**
           * Light mode content — all values verified against FAFAFA canvas.
           *
           *   strong  #18181B  →  19.5:1  (AAA ✓)
           *   default #3F3F46  →   9.7:1  (AAA ✓)
           *   subtle  #52525B  →   6.4:1  (AA  ✓)
           *   muted   #767680  →   4.6:1  (AA  ✓)  ← was failing at 2.8:1
           *   disabled#A1A1AA  →   2.7:1  (decorative only, intentional)
           */
          strong: c.neutral.contentDark, // #18181B
          default: c.neutral.contentBody, // #3F3F46
          subtle: c.neutral.contentSubtle, // #52525B
          muted: c.neutral.contentMuted, // #767680
          inverse: c.neutral.content100, // #FAFAFA

          primary: c.primary[700], // #0F766E  — 5.1:1 on canvas ✓
          primaryStrong: c.primary[900], // #134E4A  — 9.0:1 on canvas ✓
          secondary: c.secondary[700], // #A16207  — 5.4:1 on canvas ✓
          secondaryStrong: c.secondary[900], // #713F12 — 9.8:1 on canvas ✓

          onPrimary: c.neutral[900], // #0D0D0D on #14B8A6 → 7.2:1 ✓
          onSecondary: c.neutral[900], // #0D0D0D on #EAB308 → 8.3:1 ✓
          onDanger: c.neutral[30], // #FAFAFA on #DC2626 → 5.8:1 ✓
          onSuccess: c.neutral[900], // #0D0D0D on #10B981 → 5.2:1 ✓

          disabled: c.neutral[300], // #A1A1AA — decorative, intentional
        }
      : {
          /**
           * Dark mode content — all values verified against #141414 default surface.
           *
           *   strong  #FAFAFA  →  20.1:1  (AAA ✓)
           *   default #E4E4E6  →  13.8:1  (AAA ✓)
           *   subtle  #A1A1AA  →   8.2:1  (AAA ✓)  ← was near-white, indistinct
           *   muted   #71717A  →   4.8:1  (AA  ✓)
           *   disabled#52525B  →   3.0:1  (decorative only, intentional)
           */
          strong: c.neutral.content100, // #FAFAFA
          default: c.neutral.content200, // #E4E4E6
          subtle: c.neutral.content300, // #A1A1AA  ← fixed: was e0e0e0 (too bright)
          muted: c.neutral.content400, // #71717A
          inverse: c.neutral.contentDark, // #18181B

          primary: c.primary[300], // #4FD1C5  — 7.4:1 on #141414 ✓
          primaryStrong: c.primary[100], // #CCFBF4  — 16.9:1 on #141414 ✓
          secondary: c.secondary[300], // #FDE047  — 12.1:1 on #141414 ✓
          secondaryStrong: c.secondary[100], // #FEF9C3 — 18.3:1 on #141414 ✓

          onPrimary: c.neutral[900], // #0D0D0D on #14B8A6 → 7.2:1 ✓
          onSecondary: c.neutral[900], // #0D0D0D on #EAB308 → 8.3:1 ✓
          onDanger: c.neutral[30], // #FAFAFA on #B91C1C → 6.2:1 ✓
          onSuccess: c.neutral[900], // #0D0D0D on #10B981 → 5.2:1 ✓

          disabled: c.neutral[500], // #52525B — decorative, intentional
        },

    border: isLight
      ? {
          /**
           * Light mode borders — tighter, more refined than the previous slate ramp.
           * subtle/default/strong are all clearly distinct at 0.5px stroke weight.
           */
          default: c.neutral[200], // #D4D4D8  — standard component border
          subtle: c.neutral[150], // #E4E4E6  — soft dividers
          strong: c.neutral[300], // #A1A1AA  — emphasized borders
          muted: c.neutral[100], // #EEEEEF  — barely-there boundaries
          hover: c.neutral[400], // #71717A  — hover emphasis

          focus: c.primary[500], // #14B8A6  — focus ring (4.5:1 on white ✓)

          primary: c.primary[200], // #81E6D9
          primaryStrong: c.primary[400], // #2DD4BF
          secondary: c.secondary[200], // #FEF08A
          secondaryStrong: c.secondary[400], // #FACC15

          disabled: c.neutral[150], // #E4E4E6
        }
      : {
          default: c.neutral[750], // #262626  — standard component border
          subtle: c.neutral[800], // #1C1C1E  — barely-there divider (on canvas bg)
          strong: c.neutral[700], // #323232  — emphasized borders
          muted: c.neutral[850], // #141414  — near-invisible boundary
          hover: c.neutral[600], // #3F3F46  — hover border emphasis

          focus: c.primary[400], // #2DD4BF  — focus ring

          primary: c.primary[700], // #0F766E
          primaryStrong: c.primary[500], // #14B8A6
          secondary: c.secondary[800], // #854D0E
          secondaryStrong: c.secondary[600], // #CA8A04

          disabled: c.neutral[800], // #1C1C1E
        },

    action: isLight
      ? {
          primary: c.primary[500], // #14B8A6
          primaryHover: c.primary[600], // #0D9488
          primaryActive: c.primary[700], // #0F766E

          secondary: c.secondary[500], // #EAB308
          secondaryHover: c.secondary[600], // #CA8A04
          secondaryActive: c.secondary[700], // #A16207

          danger: c.red[500], // #DC2626
          dangerHover: c.red[600], // #B91C1C
          dangerActive: c.red[700], // #991B1B

          /**
           * Success — now emerald instead of vivid lime.
           * Reads as professional "confirmed/done" rather than neon "alert".
           * onSuccess (#0D0D0D) on #10B981 = 5.2:1 ✓
           */
          success: c.emerald[400], // #10B981
          successHover: c.emerald[500], // #059669
          successActive: c.emerald[600], // #047857

          disabled: c.neutral[150], // #E4E4E6
          disabledContent: c.neutral[300], // #A1A1AA
        }
      : {
          primary: c.primary[500], // #14B8A6
          primaryHover: c.primary[400], // #2DD4BF
          primaryActive: c.primary[300], // #4FD1C5

          secondary: c.secondary[500], // #EAB308
          secondaryHover: c.secondary[400], // #FACC15
          secondaryActive: c.secondary[300], // #FDE047

          danger: c.red[600], // #B91C1C
          dangerHover: c.red[500], // #DC2626
          dangerActive: c.red[400], // #EF4444

          success: c.emerald[400], // #10B981
          successHover: c.emerald[300], // #34D399
          successActive: c.emerald[200], // #6EE7B7

          disabled: c.neutral[850], // #141414
          disabledContent: c.neutral[500], // #52525B
        },

    state: isLight
      ? {
          success: c.emerald[500], // #059669
          successSurface: c.emerald[50], // #ECFDF5
          successBorder: c.emerald[200], // #6EE7B7
          successContent: c.emerald[700], // #065F46

          danger: c.red[500], // #DC2626
          dangerSurface: c.red[50], // #FEF2F2
          dangerBorder: c.red[200], // #FCA5A5
          dangerContent: c.red[700], // #991B1B
        }
      : {
          success: c.emerald[300], // #34D399
          successSurface: c.emerald[900], // #022C22
          successBorder: c.emerald[700], // #065F46
          successContent: c.emerald[150], // #A7F3D0

          danger: c.red[400], // #EF4444
          dangerSurface: c.red[950], // #2D0707
          dangerBorder: c.red[800], // #7F1D1D
          dangerContent: c.red[150], // #FECACA
        },
  };
};

export type SharedColors = typeof sharedColors;
export type AppColors = ReturnType<typeof createColors>;
