import type { AppColors, TypographyVariant } from "@sd/design-tokens";

import { Text, type TextProps } from "react-native";
import { useUnistyles } from "react-native-unistyles";

export type AppTextColorKey = keyof AppColors["content"];

export type AppTextProps = {
  variant: TypographyVariant;
  color?: AppTextColorKey;
  children: React.ReactNode;
  style?: TextProps["style"];
  numberOfLines?: number;
  onLayout?: TextProps["onLayout"];
};

export function AppText({
  variant,
  color = "strong",
  children,
  style,
  numberOfLines,
  onLayout,
}: AppTextProps) {
  const { theme } = useUnistyles();
  const textColor = theme.colors.content[color] ?? theme.colors.content.strong;

  return (
    <Text
      style={[{ color: textColor, ...theme.typography[variant] }, style]}
      numberOfLines={numberOfLines}
      onLayout={onLayout}
    >
      {children}
    </Text>
  );
}
