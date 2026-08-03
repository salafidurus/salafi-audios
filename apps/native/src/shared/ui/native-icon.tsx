import { Icon, type IconProps } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

import { nativeIconSources, type NativeIconName } from "./native-icon-sources";

export type NativeIconColorRole =
  | "strong"
  | "default"
  | "muted"
  | "primary"
  | "secondary"
  | "danger"
  | "success";

export type NativeIconProps = Omit<IconProps, "color" | "name"> & {
  name: NativeIconName;
  colorRole?: NativeIconColorRole;
  color?: string;
};

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

type Theme = ReturnType<typeof useUnistyles>["theme"];

function getIconColor(role: NativeIconColorRole, theme: Theme): string {
  switch (role) {
    case "strong":
      return theme.colors.content.strong;
    case "muted":
      return theme.colors.content.muted;
    case "primary":
      return theme.colors.content.primary;
    case "secondary":
      return theme.colors.content.secondary;
    case "danger":
      return theme.colors.state.danger;
    case "success":
      return theme.colors.state.success;
    case "default":
      return theme.colors.content.default;
  }
}
