import type { UniversalTextStyle } from "@expo/ui";
import type { StyleProp, TextStyle } from "react-native";

import { StyleSheet } from "react-native";

import { NativeText, type NativeTextProps } from "@/shared/ui/native-text";

export type AppTextProps = Omit<NativeTextProps, "style"> & {
  style?: StyleProp<TextStyle> | UniversalTextStyle;
};

export function AppText({ colorRole = "strong", style, ...props }: AppTextProps) {
  const flattenedStyle = (style ? StyleSheet.flatten(style) : undefined) as
    | UniversalTextStyle
    | undefined;

  return <NativeText colorRole={colorRole} {...props} textStyle={flattenedStyle} />;
}
