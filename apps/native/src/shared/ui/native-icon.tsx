import { Icon, type IconProps } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

import { nativeIconSources, type NativeIconName } from "./native-icon-sources";

/** Adapts semantic icon names and token color roles to Expo UI icons. */

/** Identifies a design-token color role for an icon. */
export type NativeIconColorRole =
  | "strong"
  | "default"
  | "muted"
  | "primary"
  | "danger"
  | "success"
  | "onAction";

/** Defines an icon contract using semantic names and token color roles. */
export type NativeIconProps = Omit<IconProps, "color" | "name"> & {
  name: NativeIconName;
  /** Selects the semantic theme color when `color` is not provided. */
  colorRole?: NativeIconColorRole;
  color?: string;
};

/** Renders a platform-native icon without exposing platform source identifiers. */
export function NativeIcon({ name, colorRole = "default", color, ...props }: NativeIconProps) {
  const { theme } = useUnistyles();
  return (
    <Icon
      {...props}
      name={nativeIconSources[name]}
      color={color ?? getIconColor(colorRole, theme)}
    />
  );
}

type NativeTheme = ReturnType<typeof useUnistyles>["theme"];

function getIconColor(role: NativeIconColorRole, theme: NativeTheme): string {
  switch (role) {
    case "strong":
      return theme.colors.content.strong;
    case "muted":
      return theme.colors.content.muted;
    case "primary":
      return theme.colors.content.primary;
    case "danger":
      return theme.colors.state.danger;
    case "success":
      return theme.colors.state.success;
    case "onAction":
      return theme.colors.content.onPrimary;
    case "default":
      return theme.colors.content.default;
  }
}
