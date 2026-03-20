import "react-native-unistyles";
import type { lightMobileTheme, darkMobileTheme } from "@sd/design-tokens";

type UiMobileThemes = {
  light: typeof lightMobileTheme;
  dark: typeof darkMobileTheme;
};

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends UiMobileThemes {}
}
