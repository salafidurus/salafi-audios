import { accentWebThemes, darkWebTheme, lightWebTheme } from "../core/styles/theme";
import {
  createAccentThemeCssBlock,
  createThemeCssBlock,
  getThemeProperties,
} from "../core/styles/theme/css";

export const themeCss = `
${createThemeCssBlock(":root", lightWebTheme)}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    ${getThemeProperties(darkWebTheme)}
  }
}
${createThemeCssBlock('[data-theme="dark"]', darkWebTheme)}
${createThemeCssBlock('[data-theme="light"]', lightWebTheme)}
${createAccentThemeCssBlock('[data-accent-theme="parchment"]', accentWebThemes.parchment)}
${createAccentThemeCssBlock('[data-accent-theme="manuscript"]', accentWebThemes.manuscript)}
${createAccentThemeCssBlock('[data-accent-theme="midnight"]', accentWebThemes.midnight)}
${createAccentThemeCssBlock('[data-accent-theme="ember"]', accentWebThemes.ember)}
`;
