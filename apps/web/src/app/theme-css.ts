import { darkWebTheme, lightWebTheme } from "../core/styles/theme";
import { createThemeCssBlock, getThemeProperties } from "../core/styles/theme/css";

/** Documents this module's responsibility and public boundary. */
export const themeCss = `
${createThemeCssBlock(":root", lightWebTheme)}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    ${getThemeProperties(darkWebTheme)}
  }
}
${createThemeCssBlock(':root[data-theme="dark"]', darkWebTheme)}
${createThemeCssBlock(':root[data-theme="light"]', lightWebTheme)}
`;
