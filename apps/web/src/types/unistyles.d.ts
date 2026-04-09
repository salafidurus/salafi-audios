import "react-native-unistyles";
import type {
  lightMobileTheme,
  darkMobileTheme,
  lightWebTheme,
  darkWebTheme,
} from "@sd/design-tokens";

type UiThemes = {
  light: typeof lightMobileTheme | typeof lightWebTheme;
  dark: typeof darkMobileTheme | typeof darkWebTheme;
};

declare module "react-native-unistyles" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends UiThemes {}
}
