import { Text, type TextProps } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import type { TypographyVariant } from "@sd/design-tokens";

export type AppTextProps = {
  variant: TypographyVariant;
  children: React.ReactNode;
  style?: TextProps["style"];
  numberOfLines?: number;
};

export function AppText({ variant, children, style, numberOfLines }: AppTextProps) {
  const { theme } = useUnistyles();
  return (
    <Text
      style={[{ color: theme.colors.content.primary, ...theme.typography[variant] }, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}
