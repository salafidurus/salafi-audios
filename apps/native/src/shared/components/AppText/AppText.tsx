import type { TypographyVariant } from "@sd/design-tokens";

import { Text, type TextProps } from "react-native";
import { useUnistyles } from "react-native-unistyles";

/** Describes the inputs and callbacks accepted by App Text. */
/** Describes the inputs, callbacks, and optional state accepted by App Text. */
export type AppTextProps = {
  variant: TypographyVariant;
  children: React.ReactNode;
  style?: TextProps["style"];
  numberOfLines?: number;
  onLayout?: TextProps["onLayout"];
};

/** Renders the native app text surface and coordinates its user-facing state. */
export function AppText({ variant, children, style, numberOfLines, onLayout }: AppTextProps) {
  const { theme } = useUnistyles();

  return (
    <Text
      style={[{ color: theme.colors.content.strong, ...theme.typography[variant] }, style]}
      numberOfLines={numberOfLines}
      onLayout={onLayout}
    >
      {children}
    </Text>
  );
}
