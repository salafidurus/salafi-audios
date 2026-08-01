import { Host } from "@expo/ui";
import { Button as SwiftUIButton, HStack, Text as SwiftUIText } from "@expo/ui/swift-ui";
import {
  background,
  border,
  buttonStyle,
  clipShape,
  disabled as disabledModifier,
  font,
  foregroundStyle,
  frame,
  opacity,
  padding,
  type ModifierConfig,
} from "@expo/ui/swift-ui/modifiers";
import { ActivityIndicator, type StyleProp, type ViewStyle } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { getButtonTokens, type ButtonSize, type ButtonVariant } from "./button.tokens";

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Button({
  variant = "surface",
  size = "md",
  label,
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  disabled,
  onPress,
  style,
  testID,
}: ButtonProps) {
  const { theme } = useUnistyles();
  const isDisabled = disabled || loading;
  const t = getButtonTokens(variant, size, theme);

  // "plain" has no built-in chrome — "filled"/"bordered" would paint their own
  // background/padding on top of (not instead of) the modifiers below.
  const modifiers: ModifierConfig[] = [
    buttonStyle("plain"),
    padding({ horizontal: t.paddingHorizontal }),
    frame({ height: t.height, alignment: "center" }),
    background(t.backgroundColor),
  ];
  if (t.borderWidth && t.borderColor) {
    modifiers.push(border({ color: t.borderColor, width: t.borderWidth }));
  }
  modifiers.push(clipShape("roundedRectangle", t.borderRadius));
  if (isDisabled) {
    modifiers.push(opacity(0.5), disabledModifier(true));
  }

  const textModifiers: ModifierConfig[] = [
    font({ size: t.labelStyle.fontSize, weight: mapFontWeight(t.labelStyle.fontWeight) }),
    foregroundStyle(t.labelStyle.color as string),
  ];

  return (
    <Host matchContents={!fullWidth} style={[fullWidth && base.stretch, style]}>
      <SwiftUIButton onPress={onPress} modifiers={modifiers} testID={testID}>
        <HStack spacing={t.gap} alignment="center">
          {loading ? (
            <ActivityIndicator size="small" color={t.indicatorColor} />
          ) : (
            <>
              {icon && iconPosition === "left" ? icon : null}
              <SwiftUIText modifiers={textModifiers}>{label}</SwiftUIText>
              {icon && iconPosition === "right" ? icon : null}
            </>
          )}
        </HStack>
      </SwiftUIButton>
    </Host>
  );
}

const base = {
  stretch: { width: "100%" } as ViewStyle,
};

const FONT_WEIGHT_MAP: Record<
  string,
  "ultraLight" | "thin" | "light" | "regular" | "medium" | "semibold" | "bold" | "heavy" | "black"
> = {
  "100": "ultraLight",
  "200": "thin",
  "300": "light",
  "400": "regular",
  "500": "medium",
  "600": "semibold",
  "700": "bold",
  "800": "heavy",
  "900": "black",
  normal: "regular",
  bold: "bold",
};

function mapFontWeight(weight: unknown): (typeof FONT_WEIGHT_MAP)[string] {
  return FONT_WEIGHT_MAP[String(weight ?? "400")] ?? "regular";
}
