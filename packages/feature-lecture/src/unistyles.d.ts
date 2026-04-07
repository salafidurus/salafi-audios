import type { UnistylesThemes } from "react-native-unistyles";
import type { lightMobileTheme, darkMobileTheme } from "@sd/design-tokens";

type AppThemes = {
  light: typeof lightMobileTheme;
  dark: typeof darkMobileTheme;
};

declare module "react-native-unistyles" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
}
