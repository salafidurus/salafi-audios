import type { UniversalStyle, UniversalTextStyle } from "@expo/ui";
import type { TypographyVariant } from "@sd/design-tokens";

import { Host, Text as ExpoText } from "@expo/ui";
import {
  Platform,
  StyleSheet as RNStyleSheet,
  Text as RNText,
  type TextProps,
  type TextStyle,
} from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { toUniversalStyle, toUniversalTextStyle } from "../../../core/styles/expo-ui";

/** Provides a reusable native text primitive with semantic typography and layout forwarding. */
/** Describes the text content, semantic variant, and layout behavior accepted by AppText. */
export type AppTextProps = {
  variant: TypographyVariant;
  children: React.ReactNode;
  style?: TextProps["style"];
  numberOfLines?: number;
  onLayout?: TextProps["onLayout"];
};

/** Renders semantic app typography through Expo UI's native text surface. */
export function AppText({ variant, children, style, numberOfLines, onLayout }: AppTextProps) {
  const { theme } = useUnistyles();
  const flattened = RNStyleSheet.flatten(style) ?? {};
  const textStyle: UniversalTextStyle = {
    ...toUniversalTextStyle(theme, variant, theme.colors.content.strong),
    ...pickTextStyle(flattened),
  };
  const universalStyle = toUniversalStyle(pickUniversalStyle(flattened));
  // SAFETY: Expo UI Text accepts the same text children rendered by this primitive at runtime.
  const textChildren = children as string;

  // Expo UI Text currently loses nested Android text during measurement in
  // RN list/layout trees. RN Text keeps the same semantic token styles while
  // restoring wrapping, onLayout, and accessibility on that platform.
  if (Platform.OS === "android") {
    return (
      <RNText style={flattened} numberOfLines={numberOfLines} onLayout={onLayout}>
        {textChildren}
      </RNText>
    );
  }

  return (
    <Host
      // Let React Native own horizontal sizing so labels can wrap in rows;
      // let the native text surface determine its intrinsic height.
      matchContents={{ vertical: true }}
      style={pickLayoutStyle(flattened)}
      onLayout={onLayout}
    >
      <ExpoText style={universalStyle} textStyle={textStyle} numberOfLines={numberOfLines}>
        {textChildren}
      </ExpoText>
    </Host>
  );
}

const UNIVERSAL_STYLE_KEYS = [
  "padding",
  "paddingHorizontal",
  "paddingVertical",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "backgroundColor",
  "borderRadius",
  "borderWidth",
  "borderColor",
  "opacity",
  "width",
  "height",
] as const satisfies readonly (keyof UniversalStyle)[];

const TEXT_STYLE_KEYS = [
  "fontSize",
  "fontWeight",
  "fontFamily",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "color",
] as const satisfies readonly (keyof UniversalTextStyle)[];

function pickUniversalStyle(style: TextStyle): Partial<UniversalStyle> {
  const picked = Object.fromEntries(
    UNIVERSAL_STYLE_KEYS.flatMap((key) => (style[key] === undefined ? [] : [[key, style[key]]])),
  );
  // SAFETY: every key is selected from UNIVERSAL_STYLE_KEYS, which satisfies keyof UniversalStyle.
  return picked as Partial<UniversalStyle>;
}

function pickTextStyle(style: TextStyle): Partial<UniversalTextStyle> {
  const picked = Object.fromEntries(
    TEXT_STYLE_KEYS.flatMap((key) => (style[key] === undefined ? [] : [[key, style[key]]])),
  );
  // SAFETY: every key is selected from TEXT_STYLE_KEYS, which satisfies keyof UniversalTextStyle.
  return picked as Partial<UniversalTextStyle>;
}

function pickLayoutStyle(style: TextStyle) {
  const universalKeys = new Set<string>([...UNIVERSAL_STYLE_KEYS, ...TEXT_STYLE_KEYS]);
  return Object.fromEntries(Object.entries(style).filter(([key]) => !universalKeys.has(key)));
}
