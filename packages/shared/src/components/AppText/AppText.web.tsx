import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Text } from "react-native-unistyles/components/native/Text";
import type { TypographyVariant, lightMobileTheme } from "@sd/design-tokens";

export type AppTextProps = {
  variant: TypographyVariant;
  children: React.ReactNode;
  style?: Record<string, unknown>;
  numberOfLines?: number;
};

type SharedTheme = typeof lightMobileTheme;

export function AppTextWeb({ variant, children, style, numberOfLines }: AppTextProps) {
  const { theme } = useUnistyles() as unknown as { theme: SharedTheme };
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
