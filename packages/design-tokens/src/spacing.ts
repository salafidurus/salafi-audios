export const spacingShared = {
  space1: "0.25rem",
  space2: "0.5rem",
  space3: "0.75rem",
  space4: "1rem",
  space5: "1.25rem",
  space6: "1.5rem",
  space7: "2rem",
  space8: "2.5rem",
} as const;

export const spacingWeb = {
  pageX: "clamp(1.15rem, 3.8vw, 2.75rem)",
  pageY: "clamp(1.25rem, 3vw, 2rem)",
  sectionY: "clamp(1.2rem, 2vw, 1.8rem)",
  cardP: "1.05rem",
  panelP: "1.15rem",
  chipX: "0.72rem",
  chipY: "0.32rem",
  gapSm: "0.5rem",
  gapMd: "0.75rem",
  gapLg: "1rem",
  gapXl: "1.4rem",
  contentMax: "84rem",
} as const;

export const spacingMobile = {
  spaceXs: 4,
  spaceSm: 8,
  spaceMd: 12,
  spaceLg: 16,
  spaceXl: 20,
  space2xl: 24,
  space3xl: 32,
  space4xl: 40,
} as const;

export const spacing = {
  ...spacingShared,
  ...spacingWeb,
  ...spacingMobile,
} as const;

export type Spacing = typeof spacing;
export type SpacingShared = typeof spacingShared;
export type SpacingWeb = typeof spacingWeb;
export type SpacingMobile = typeof spacingMobile;
