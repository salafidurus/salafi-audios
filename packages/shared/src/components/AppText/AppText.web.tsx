import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Text } from "react-native-unistyles/components/native/Text";
import type { TypographyVariant } from "@sd/design-tokens";

export type AppTextProps = {
  variant: TypographyVariant;
  children: React.ReactNode;
  style?: Record<string, unknown>;
  numberOfLines?: number;
};

export function AppTextWeb({ variant, children, style, numberOfLines }: AppTextProps) {
  const { theme } = useUnistyles();
  return (
    <Text
      style={[
        {
          color: theme.colors.content.primary,
          _web: {
            ...theme.typography[variant],
            lineHeight: String(theme.typography[variant].lineHeight),
          },
        },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}
