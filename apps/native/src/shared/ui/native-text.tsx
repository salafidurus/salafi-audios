import type { TypographyVariant } from "@sd/design-tokens";
import type { ReactNode } from "react";

import { Text, type TextProps, type UniversalTextStyle } from "@expo/ui";
import {
  Platform,
  StyleSheet as RNStyleSheet,
  Text as RNText,
  type TextProps as RNTextProps,
  type LayoutChangeEvent,
  type StyleProp,
  type TextStyle,
} from "react-native";
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
export type NativeTextProps = Omit<TextProps, "children" | "textStyle" | "style"> & {
  /** Supported content is deliberately narrow; rich nested content needs its own adapter. */
  children?: ReactNode;
  variant?: TypographyVariant;
  /** Selects the token color while allowing an explicit text-style override. */
  colorRole?: NativeTextColorRole;
  textStyle?: UniversalTextStyle;
  /** Accepts existing RN text styles while the caller migration is completed. */
  style?: StyleProp<TextStyle>;
  onLayout?: (event: LayoutChangeEvent) => void;
};

/** Renders text through Expo UI while preserving token typography and color roles. */
export function NativeText({
  children,
  variant = "bodyMd",
  colorRole = "default",
  style,
  textStyle,
  ...props
}: NativeTextProps) {
  const { theme } = useUnistyles();
  // SAFETY: callers provide text-compatible primitives or adjacent text nodes; Expo UI Text owns the leaf.
  const content = children == null ? undefined : (children as string);
  const flattenedStyle = RNStyleSheet.flatten(style) ?? {};

  // Expo UI Text is Compose-backed on Android and must be a direct Host child.
  // Existing feature layouts are RN trees, so keep this leaf in RN on Android;
  // this also preserves wrapping and measurement in virtualized rows.
  if (Platform.OS === "android") {
    return (
      <RNText
        // SAFETY: NativeText removes Expo UI-only props before forwarding the shared text contract to RN.
        {...(props as RNTextProps)}
        numberOfLines={props.numberOfLines}
        onLayout={props.onLayout}
        // SAFETY: the shared typography tokens and mapped UniversalTextStyle fields are valid RN text styles.
        style={[
          theme.typography[variant] as RNTextProps["style"],
          { color: getTextColor(colorRole, theme) },
          flattenedStyle,
          textStyle as RNTextProps["style"],
        ]}
      >
        {children}
      </RNText>
    );
  }

  return (
    <Text
      {...props}
      textStyle={{
        ...theme.typography[variant],
        color: getTextColor(colorRole, theme),
        ...pickTextStyle(flattenedStyle),
        ...textStyle,
      }}
    >
      {content}
    </Text>
  );
}

function pickTextStyle(style: TextStyle): Partial<UniversalTextStyle> {
  const fontWeight = mapFontWeight(style.fontWeight);
  const textAlign = mapTextAlign(style.textAlign);
  const entries = [
    ["color", style.color === undefined ? undefined : String(style.color)],
    ["fontFamily", style.fontFamily],
    ["fontSize", style.fontSize],
    ["fontWeight", fontWeight],
    ["letterSpacing", style.letterSpacing],
    ["lineHeight", style.lineHeight],
    ["textAlign", textAlign],
  ].filter((entry) => entry[1] !== undefined);
  // SAFETY: every key comes from the UniversalTextStyle-compatible mapping above.
  return Object.fromEntries(entries) as Partial<UniversalTextStyle>;
}

function mapFontWeight(
  weight: TextStyle["fontWeight"],
): UniversalTextStyle["fontWeight"] | undefined {
  const normalized = String(weight ?? "");
  if (
    !["normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"].includes(
      normalized,
    )
  ) {
    return undefined;
  }
  // SAFETY: the preceding membership check restricts the string to Expo UI's accepted weights.
  return normalized as UniversalTextStyle["fontWeight"];
}

function mapTextAlign(align: TextStyle["textAlign"]): UniversalTextStyle["textAlign"] | undefined {
  return align === "left" || align === "right" || align === "center" ? align : undefined;
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
