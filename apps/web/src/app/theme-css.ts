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
${createThemeCssBlock(':root[data-theme="dark"]', darkWebTheme)}
${createThemeCssBlock(':root[data-theme="light"]', lightWebTheme)}
${createAccentThemeCssBlock(':root[data-accent-theme="parchment"]', accentWebThemes.parchment)}
${createAccentThemeCssBlock(':root[data-accent-theme="manuscript"]', accentWebThemes.manuscript)}
${createAccentThemeCssBlock(':root[data-accent-theme="midnight"]', accentWebThemes.midnight)}
${createAccentThemeCssBlock(':root[data-accent-theme="ember"]', accentWebThemes.ember)}
`;

