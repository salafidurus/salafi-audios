import type { TypographyVariant } from "@sd/design-tokens";

import { Text, type TextProps, type UniversalTextStyle } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

export type NativeTextColorRole =
  | "strong"
  | "default"
  | "muted"
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "onAction";

export type NativeTextProps = Omit<TextProps, "children" | "textStyle"> & {
  children?: string | number;
  variant?: TypographyVariant;
  colorRole?: NativeTextColorRole;
  textStyle?: UniversalTextStyle;
};

export function NativeText({
  children,
  variant = "bodyMd",
  colorRole = "default",
  textStyle,
  ...props
}: NativeTextProps) {
  const { theme } = useUnistyles();

  return (
    <Text
      {...props}
      textStyle={{
        ...theme.typography[variant],
        color: getTextColor(colorRole, theme),
        ...textStyle,
      }}
    >
      {children == null ? undefined : String(children)}
    </Text>
  );
}

type Theme = ReturnType<typeof useUnistyles>["theme"];

function getTextColor(role: NativeTextColorRole, theme: Theme): string {
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
    case "onAction":
      return theme.colors.content.onPrimary;
    case "default":
      return theme.colors.content.default;
  }
}
