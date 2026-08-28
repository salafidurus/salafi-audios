import type { TypographyVariant } from "@sd/design-tokens";

import { Text, type TextProps } from "react-native";
import { useUnistyles } from "react-native-unistyles";

/** Describes the AppTextProps native contract and behavior. */
/** Describes the AppTextProps native type contract and behavior. */
export type AppTextProps = {
  variant: TypographyVariant;
  children: React.ReactNode;
  style?: TextProps["style"];
  numberOfLines?: number;
  onLayout?: TextProps["onLayout"];
};

/** Describes the AppText native contract and behavior. */
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
