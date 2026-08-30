import {
  Button as ExpoButton,
  Host,
  Row,
  Text as ExpoText,
  type UniversalStyle,
  type UniversalTextStyle,
} from "@expo/ui";
import {
  ActivityIndicator,
  View,
  type DimensionValue,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { getButtonTokens, type ButtonSize, type ButtonVariant } from "./button.tokens";

/** Provides the cross-platform native Button primitive and its shared styling bridge. */
/**
 * Defines the stable Button contract shared by iOS and Android.
 *
 * Loading disables the action and replaces its label with an activity indicator;
 * `style` remains a React Native container style so callers can control layout
 * without depending on platform-specific native modifier APIs.
 */
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

const FULL_WIDTH: DimensionValue = "100%";

const VARIANT_MAP = {
  primary: "filled",
  surface: "filled",
  outline: "outlined",
  ghost: "text",
  danger: "filled",
} satisfies Record<ButtonVariant, "filled" | "outlined" | "text">;

function resolveDisabled(disabled: boolean | undefined, loading: boolean) {
  return disabled || loading;
}

function getContainerStyle(fullWidth: boolean, style: StyleProp<ViewStyle>) {
  return [fullWidth ? base.stretch : base.intrinsic, style];
}

function getPressHandler(isDisabled: boolean, onPress: (() => void) | undefined) {
  return isDisabled ? undefined : onPress;
}

function toUniversalButtonStyle(
  tokens: ReturnType<typeof getButtonTokens>,
  fullWidth: boolean,
  disabled: boolean,
): UniversalStyle {
  return {
    backgroundColor: tokens.backgroundColor,
    borderColor: tokens.borderColor,
    borderRadius: tokens.borderRadius,
    borderWidth: tokens.borderWidth,
    height: tokens.height,
    opacity: disabled ? 0.5 : undefined,
    paddingHorizontal: tokens.paddingHorizontal,
    width: fullWidth ? FULL_WIDTH : undefined,
  };
}

function toUniversalTextStyle(
  labelStyle: ReturnType<typeof getButtonTokens>["labelStyle"],
  color: string,
): UniversalTextStyle {
  return {
    color,
    fontSize: labelStyle.fontSize,
    fontWeight: mapFontWeight(labelStyle.fontWeight),
    letterSpacing: labelStyle.letterSpacing,
    lineHeight: labelStyle.lineHeight,
  };
}

function mapFontWeight(
  weight: TextStyle["fontWeight"] | undefined,
): UniversalTextStyle["fontWeight"] {
  const normalizedWeight = String(weight ?? "400");
  switch (normalizedWeight) {
    case "normal":
    case "bold":
    case "100":
    case "200":
    case "300":
    case "400":
    case "500":
    case "600":
    case "700":
    case "800":
    case "900":
      return normalizedWeight;
    default:
      return "400";
  }
}

function renderButtonContent(
  loading: boolean,
  icon: React.ReactNode,
  iconPosition: "left" | "right",
  gap: number,
  indicatorColor: string,
  label: string,
  textStyle: UniversalTextStyle,
) {
  if (loading) return <ActivityIndicator size="small" color={indicatorColor} />;

  return (
    <Row alignment="center" spacing={gap}>
      {icon && iconPosition === "left" ? icon : null}
      <ExpoText textStyle={textStyle}>{label}</ExpoText>
      {icon && iconPosition === "right" ? icon : null}
    </Row>
  );
}

/**
 * Renders a universal native button while keeping arbitrary caller layout styles
 * on the React Native container boundary.
 *
 * Loading is treated as disabled so callers cannot trigger the action while its
 * indicator is visible. ConfirmDialog deliberately remains platform-specific
 * because Expo UI 57 does not expose a universal dialog component.
 */
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
  const isDisabled = resolveDisabled(disabled, loading);
  const tokens = getButtonTokens(variant, size, theme);

  return (
    <View style={getContainerStyle(fullWidth, style)}>
      <Host matchContents={!fullWidth}>
        <ExpoButton
          disabled={isDisabled}
          onPress={getPressHandler(isDisabled, onPress)}
          testID={testID}
          variant={VARIANT_MAP[variant]}
          style={toUniversalButtonStyle(tokens, fullWidth, isDisabled)}
        >
          {renderButtonContent(
            loading,
            icon,
            iconPosition,
            tokens.gap,
            tokens.indicatorColor,
            label,
            toUniversalTextStyle(tokens.labelStyle, tokens.textColor),
          )}
        </ExpoButton>
      </Host>
    </View>
  );
}

const base = {
  intrinsic: { alignSelf: "flex-start" as const },
  stretch: { width: FULL_WIDTH },
};
