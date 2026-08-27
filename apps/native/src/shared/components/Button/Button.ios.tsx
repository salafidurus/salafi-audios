import { Host } from "@expo/ui";
import { Button as SwiftUIButton, HStack, Text as SwiftUIText } from "@expo/ui/swift-ui";
import {
  background,
  border,
  buttonStyle,
  cornerRadius,
  disabled as disabledModifier,
  font,
  foregroundStyle,
  frame,
  opacity,
  padding,
  type ModifierConfig,
} from "@expo/ui/swift-ui/modifiers";
import {
  ActivityIndicator,
  type DimensionValue,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
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

type SwiftFontWeight =
  | "ultraLight"
  | "thin"
  | "light"
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "heavy"
  | "black";

const FULL_WIDTH: DimensionValue = "100%";

function buildModifiers(
  t: ReturnType<typeof getButtonTokens>,
  isDisabled: boolean,
): ModifierConfig[] {
  const modifiers: ModifierConfig[] = [
    buttonStyle("plain"),
    padding({ horizontal: t.paddingHorizontal }),
    frame({ height: t.height, alignment: "center" }),
    background(t.backgroundColor),
  ];
  if (t.borderWidth && t.borderColor)
    modifiers.push(border({ color: t.borderColor, width: t.borderWidth }));
  modifiers.push(cornerRadius(t.borderRadius));
  if (isDisabled) modifiers.push(opacity(0.5), disabledModifier(true));
  return modifiers;
}

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
  const modifiers = buildModifiers(t, isDisabled);

  const textModifiers: ModifierConfig[] = [
    font({ size: t.labelStyle.fontSize, weight: mapFontWeight(t.labelStyle.fontWeight) }),
    foregroundStyle(getSwiftTextColor(t.labelStyle.color, t.textColor)),
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
  stretch: { width: FULL_WIDTH },
};

const FONT_WEIGHT_MAP = {
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
} satisfies Record<string, SwiftFontWeight>;

function mapFontWeight(weight: TextStyle["fontWeight"] | undefined): SwiftFontWeight {
  const normalizedWeight = String(weight ?? "400");
  switch (normalizedWeight) {
    case "100":
      return FONT_WEIGHT_MAP["100"];
    case "200":
      return FONT_WEIGHT_MAP["200"];
    case "300":
      return FONT_WEIGHT_MAP["300"];
    case "400":
      return FONT_WEIGHT_MAP["400"];
    case "500":
      return FONT_WEIGHT_MAP["500"];
    case "600":
      return FONT_WEIGHT_MAP["600"];
    case "700":
      return FONT_WEIGHT_MAP["700"];
    case "800":
      return FONT_WEIGHT_MAP["800"];
    case "900":
      return FONT_WEIGHT_MAP["900"];
    case "normal":
      return FONT_WEIGHT_MAP.normal;
    case "bold":
      return FONT_WEIGHT_MAP.bold;
    default:
      return "regular";
  }
}

function getSwiftTextColor(color: TextStyle["color"], fallback: string): string {
  return color !== undefined && color !== null ? String(color) : fallback;
}
