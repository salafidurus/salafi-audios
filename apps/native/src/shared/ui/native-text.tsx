import type { TypographyVariant } from "@sd/design-tokens";

import { Text, type TextProps, type UniversalTextStyle } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

/** Adapts design-token typography and semantic colors to Expo UI text. */

/** Semantic theme roles callers use instead of raw product colors. */
export type NativeTextColorRole =
  | "strong"
  | "default"
  | "subtle"
  | "muted"
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "onAction";

/** Defines the narrow semantic text contract used by the native foundation. */
export type NativeTextProps = Omit<TextProps, "children" | "textStyle"> & {
  children?: React.ReactNode;
  variant?: TypographyVariant;
  /** Selects the token color while allowing an explicit text-style override. */
  colorRole?: NativeTextColorRole;
  textStyle?: UniversalTextStyle;
};

/** Renders text through Expo UI while preserving token typography and color roles. */
export function NativeText({
  children,
  variant = "bodyMd",
  colorRole = "default",
  textStyle,
  ...props
}: NativeTextProps) {
  const { theme } = useUnistyles();
  const content = children == null ? undefined : String(children);

  return (
    <Text
      {...props}
      textStyle={{
        ...theme.typography[variant],
        color: getTextColor(colorRole, theme),
        ...textStyle,
      }}
    >
      {content}
    </Text>
  );
}

type NativeTheme = ReturnType<typeof useUnistyles>["theme"];

function getTextColor(role: NativeTextColorRole, theme: NativeTheme): string {
  switch (role) {
    case "strong":
      return theme.colors.content.strong;
    case "subtle":
      return theme.colors.content.subtle;
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
