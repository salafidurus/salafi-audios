import { lightWebTheme, darkWebTheme } from "@sd/design-tokens";

const createThemeCss = (selector: string, theme: typeof lightWebTheme, isDark: boolean) => {
  const chromeSurface = `color-mix(in srgb, ${theme.colors.surface.elevated} ${isDark ? "92%" : "88%"}, transparent)`;
  const chromeSurfaceStrong = `color-mix(in srgb, ${theme.colors.surface.elevated} ${isDark ? "96%" : "93%"}, transparent)`;
  const chromeBorder = `color-mix(in srgb, ${theme.colors.border.subtle} ${isDark ? "82%" : "88%"}, transparent)`;
  const chromeBorderStrong = `color-mix(in srgb, ${theme.colors.border.default} ${isDark ? "84%" : "82%"}, transparent)`;
  const inputSurfaceRest = theme.colors.surface.subtle;
  const inputSurfaceFocus = theme.colors.surface.default;
  const inputBorderRest = `color-mix(in srgb, ${theme.colors.border.default} ${isDark ? "76%" : "84%"}, transparent)`;
  const inputBorderFocus = theme.colors.border.primary;
  const hoverAccentSurface = `color-mix(in srgb, ${theme.colors.surface.primarySubtle} ${isDark ? "54%" : "72%"}, ${theme.colors.surface.subtle})`;
  const screenWashPrimary = `radial-gradient(circle at 12% 14%, color-mix(in srgb, ${theme.colors.surface.primarySubtle} ${isDark ? "70%" : "100%"}, transparent), transparent 42%)`;
  const screenWashSecondary = `radial-gradient(circle at 14% 14%, color-mix(in srgb, ${theme.colors.surface.secondarySubtle} ${isDark ? "70%" : "100%"}, transparent), transparent 40%)`;
  const screenWashMixed = `radial-gradient(circle at 14% 12%, color-mix(in srgb, ${theme.colors.surface.primarySubtle} ${isDark ? "64%" : "94%"}, transparent), transparent 38%), radial-gradient(circle at 88% 10%, color-mix(in srgb, ${theme.colors.surface.secondarySubtle} ${isDark ? "62%" : "90%"}, transparent), transparent 32%)`;

  return `
${selector} {
  --surface-canvas: ${theme.colors.surface.canvas};
  --surface-default: ${theme.colors.surface.default};
  --surface-subtle: ${theme.colors.surface.subtle};
  --surface-elevated: ${theme.colors.surface.elevated};
  --surface-hover: ${theme.colors.surface.hover};
  --surface-inverse: ${theme.colors.surface.inverse};
  --surface-primary-subtle: ${theme.colors.surface.primarySubtle};
  --surface-secondary-subtle: ${theme.colors.surface.secondarySubtle};
  --surface-selected: ${theme.colors.surface.selected};
  --surface-disabled: ${theme.colors.surface.disabled};

  --content-default: ${theme.colors.content.default};
  --content-muted: ${theme.colors.content.muted};
  --content-subtle: ${theme.colors.content.subtle};
  --content-strong: ${theme.colors.content.strong};
  --content-inverse: ${theme.colors.content.inverse};
  --content-primary: ${theme.colors.content.primary};
  --content-primary-strong: ${theme.colors.content.primaryStrong};
  --content-secondary: ${theme.colors.content.secondary};
  --content-secondary-strong: ${theme.colors.content.secondaryStrong};
  --content-on-primary: ${theme.colors.content.onPrimary};
  --content-on-secondary: ${theme.colors.content.onSecondary};
  --content-on-danger: ${theme.colors.content.onDanger};
  --content-on-success: ${theme.colors.content.onSuccess};
  --content-disabled: ${theme.colors.content.disabled};

  --border-default: ${theme.colors.border.default};
  --border-subtle: ${theme.colors.border.subtle};
  --border-strong: ${theme.colors.border.strong};
  --border-muted: ${theme.colors.border.muted};
  --border-hover: ${theme.colors.border.hover};
  --border-focus: ${theme.colors.border.focus};
  --border-primary: ${theme.colors.border.primary};
  --border-primary-strong: ${theme.colors.border.primaryStrong};
  --border-secondary: ${theme.colors.border.secondary};
  --border-secondary-strong: ${theme.colors.border.secondaryStrong};
  --border-disabled: ${theme.colors.border.disabled};

  --action-primary: ${theme.colors.action.primary};
  --action-primary-hover: ${theme.colors.action.primaryHover};
  --action-primary-active: ${theme.colors.action.primaryActive};
  --accent-primary-bg: ${theme.recipes.primaryCta.background};
  --accent-primary-bg-hover: ${theme.recipes.primaryCta.backgroundHover};
  --accent-primary-bg-active: ${theme.recipes.primaryCta.backgroundActive};
  --accent-primary-border: ${theme.recipes.primaryCta.borderColor};
  --accent-primary-border-hover: ${theme.recipes.primaryCta.borderColorHover};
  --accent-primary-fg: ${theme.recipes.primaryCta.textColor};
  --accent-primary-subtle-surface: ${theme.recipes.primarySubtleSurface.background};
  --accent-primary-subtle-border: ${theme.recipes.primarySubtleSurface.borderColor};
  --accent-primary-subtle-fg: ${theme.recipes.primarySubtleSurface.textColor};
  --accent-secondary-subtle-surface: ${theme.recipes.secondarySubtleSurface.background};
  --accent-secondary-subtle-border: ${theme.recipes.secondarySubtleSurface.borderColor};
  --accent-secondary-subtle-fg: ${theme.recipes.secondarySubtleSurface.textColor};
  --accent-mixed-surface: ${theme.recipes.mixedHeroSurface.background};
  --accent-mixed-border: ${theme.recipes.mixedHeroSurface.borderColor};
  --accent-divider: ${theme.recipes.dividerColor};
  --accent-focus-ring: ${theme.recipes.focusRingColor};
  --chrome-surface: ${chromeSurface};
  --chrome-surface-strong: ${chromeSurfaceStrong};
  --chrome-border: ${chromeBorder};
  --chrome-border-strong: ${chromeBorderStrong};
  --chrome-shadow: ${theme.shadows.lg};
  --input-surface-rest: ${inputSurfaceRest};
  --input-surface-focus: ${inputSurfaceFocus};
  --input-border-rest: ${inputBorderRest};
  --input-border-focus: ${inputBorderFocus};
  --hover-accent-surface: ${hoverAccentSurface};
  --screen-wash-primary: ${screenWashPrimary};
  --screen-wash-secondary: ${screenWashSecondary};
  --screen-wash-mixed: ${screenWashMixed};
  --action-secondary: ${theme.colors.action.secondary};
  --action-secondary-hover: ${theme.colors.action.secondaryHover};
  --action-secondary-active: ${theme.colors.action.secondaryActive};
  --action-danger: ${theme.colors.action.danger};
  --action-danger-hover: ${theme.colors.action.dangerHover};
  --action-danger-active: ${theme.colors.action.dangerActive};
  --action-success: ${theme.colors.action.success};
  --action-success-hover: ${theme.colors.action.successHover};
  --action-success-active: ${theme.colors.action.successActive};
  --action-disabled: ${theme.colors.action.disabled};
  --action-disabled-content: ${theme.colors.action.disabledContent};

  --state-success: ${theme.colors.state.success};
  --state-success-surface: ${theme.colors.state.successSurface};
  --state-success-border: ${theme.colors.state.successBorder};
  --state-success-content: ${theme.colors.state.successContent};
  --state-danger: ${theme.colors.state.danger};
  --state-danger-surface: ${theme.colors.state.dangerSurface};
  --state-danger-border: ${theme.colors.state.dangerBorder};
  --state-danger-content: ${theme.colors.state.dangerContent};

  --space-layout-page-x: ${theme.spacing.layout.pageX};
  --space-layout-page-y: ${theme.spacing.layout.pageY};
  --space-layout-section-y: ${theme.spacing.layout.sectionY};
  --space-layout-content-max: ${theme.spacing.layout.contentMax};

  --space-component-card-padding: ${theme.spacing.component.cardPadding};
  --space-component-panel-padding: ${theme.spacing.component.panelPadding};
  --space-component-chip-x: ${theme.spacing.component.chipX};
  --space-component-chip-y: ${theme.spacing.component.chipY};
  --space-component-gap-sm: ${theme.spacing.component.gapSm};
  --space-component-gap-md: ${theme.spacing.component.gapMd};
  --space-component-gap-lg: ${theme.spacing.component.gapLg};
  --space-component-gap-xl: ${theme.spacing.component.gapXl};

  --space-scale-xs: ${theme.spacing.scale.xs};
  --space-scale-sm: ${theme.spacing.scale.sm};
  --space-scale-md: ${theme.spacing.scale.md};
  --space-scale-lg: ${theme.spacing.scale.lg};
  --space-scale-xl: ${theme.spacing.scale.xl};
  --space-scale-2xl: ${theme.spacing.scale["2xl"]};
  --space-scale-3xl: ${theme.spacing.scale["3xl"]};
  --space-scale-4xl: ${theme.spacing.scale["4xl"]};

  --radius-scale-xs: ${theme.radius.scale.xs};
  --radius-scale-sm: ${theme.radius.scale.sm};
  --radius-scale-md: ${theme.radius.scale.md};
  --radius-scale-lg: ${theme.radius.scale.lg};
  --radius-scale-xl: ${theme.radius.scale.xl};
  --radius-scale-full: ${theme.radius.scale.full};

  --radius-component-chip: ${theme.radius.component.chip};
  --radius-component-card: ${theme.radius.component.card};
  --radius-component-panel-sm: ${theme.radius.component.panelSm};
  --radius-component-panel: ${theme.radius.component.panel};

  --shadow-xs: ${theme.shadows.xs};
  --shadow-sm: ${theme.shadows.sm};
  --shadow-md: ${theme.shadows.md};
  --shadow-lg: ${theme.shadows.lg};
  --shadow-top: ${theme.shadows.top};
  --shadow-focus: ${theme.shadows.focus};

  --typo-display-lg-font-family: ${theme.typography.displayLg.fontFamily};
  --typo-display-lg-font-size: ${theme.typography.displayLg.fontSize};
  --typo-display-lg-line-height: ${theme.typography.displayLg.lineHeight};
  --typo-display-lg-font-weight: ${theme.typography.displayLg.fontWeight};
  --typo-display-lg-letter-spacing: ${theme.typography.displayLg.letterSpacing};

  --typo-display-md-font-family: ${theme.typography.displayMd.fontFamily};
  --typo-display-md-font-size: ${theme.typography.displayMd.fontSize};
  --typo-display-md-line-height: ${theme.typography.displayMd.lineHeight};
  --typo-display-md-font-weight: ${theme.typography.displayMd.fontWeight};
  --typo-display-md-letter-spacing: ${theme.typography.displayMd.letterSpacing};

  --typo-title-lg-font-family: ${theme.typography.titleLg.fontFamily};
  --typo-title-lg-font-size: ${theme.typography.titleLg.fontSize};
  --typo-title-lg-line-height: ${theme.typography.titleLg.lineHeight};
  --typo-title-lg-font-weight: ${theme.typography.titleLg.fontWeight};
  --typo-title-lg-letter-spacing: ${theme.typography.titleLg.letterSpacing};

  --typo-title-md-font-family: ${theme.typography.titleMd.fontFamily};
  --typo-title-md-font-size: ${theme.typography.titleMd.fontSize};
  --typo-title-md-line-height: ${theme.typography.titleMd.lineHeight};
  --typo-title-md-font-weight: ${theme.typography.titleMd.fontWeight};
  --typo-title-md-letter-spacing: ${theme.typography.titleMd.letterSpacing};

  --typo-body-lg-font-family: ${theme.typography.bodyLg.fontFamily};
  --typo-body-lg-font-size: ${theme.typography.bodyLg.fontSize};
  --typo-body-lg-line-height: ${theme.typography.bodyLg.lineHeight};
  --typo-body-lg-font-weight: ${theme.typography.bodyLg.fontWeight};
  --typo-body-lg-letter-spacing: ${theme.typography.bodyLg.letterSpacing};

  --typo-body-md-font-family: ${theme.typography.bodyMd.fontFamily};
  --typo-body-md-font-size: ${theme.typography.bodyMd.fontSize};
  --typo-body-md-line-height: ${theme.typography.bodyMd.lineHeight};
  --typo-body-md-font-weight: ${theme.typography.bodyMd.fontWeight};
  --typo-body-md-letter-spacing: ${theme.typography.bodyMd.letterSpacing};

  --typo-body-sm-font-family: ${theme.typography.bodySm.fontFamily};
  --typo-body-sm-font-size: ${theme.typography.bodySm.fontSize};
  --typo-body-sm-line-height: ${theme.typography.bodySm.lineHeight};
  --typo-body-sm-font-weight: ${theme.typography.bodySm.fontWeight};
  --typo-body-sm-letter-spacing: ${theme.typography.bodySm.letterSpacing};

  --typo-label-md-font-family: ${theme.typography.labelMd.fontFamily};
  --typo-label-md-font-size: ${theme.typography.labelMd.fontSize};
  --typo-label-md-line-height: ${theme.typography.labelMd.lineHeight};
  --typo-label-md-font-weight: ${theme.typography.labelMd.fontWeight};
  --typo-label-md-letter-spacing: ${theme.typography.labelMd.letterSpacing};

  --typo-caption-font-family: ${theme.typography.caption.fontFamily};
  --typo-caption-font-size: ${theme.typography.caption.fontSize};
  --typo-caption-line-height: ${theme.typography.caption.lineHeight};
  --typo-caption-font-weight: ${theme.typography.caption.fontWeight};
  --typo-caption-letter-spacing: ${theme.typography.caption.letterSpacing};

  --typo-xs-font-family: ${theme.typography.xs.fontFamily};
  --typo-xs-font-size: ${theme.typography.xs.fontSize};
  --typo-xs-line-height: ${theme.typography.xs.lineHeight};
  --typo-xs-font-weight: ${theme.typography.xs.fontWeight};
  --typo-xs-letter-spacing: ${theme.typography.xs.letterSpacing};
}
`;
};

export const themeCss = `
${createThemeCss(":root", lightWebTheme, false)}
${createThemeCss('[data-theme="dark"]', darkWebTheme, true)}
`;
