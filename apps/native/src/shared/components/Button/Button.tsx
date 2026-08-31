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
  Platform,
  Pressable,
  Text as RNText,
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
  /** Announces the action label while the Expo button remains the native action target. */
  accessibilityLabel?: string;
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

  if (!icon) return <ExpoText textStyle={textStyle}>{label}</ExpoText>;

  return (
    <Row alignment="center" spacing={gap}>
      {icon && iconPosition === "left" ? icon : null}
      <ExpoText textStyle={textStyle}>{label}</ExpoText>
      {icon && iconPosition === "right" ? icon : null}
    </Row>
  );
}

function AndroidButton({
  label,
  icon,
  iconPosition,
  fullWidth,
  disabled,
  loading,
  onPress,
  accessibilityLabel,
  style,
  testID,
  tokens,
}: ButtonProps & { tokens: ReturnType<typeof getButtonTokens> }) {
  const isDisabled = resolveDisabled(disabled, loading ?? false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={isDisabled}
      onPress={getPressHandler(isDisabled, onPress)}
      testID={testID}
      style={({ pressed }) => [
        getContainerStyle(fullWidth ?? false, style),
        styles.androidButton,
        // SAFETY: AndroidButton only consumes the same primitive color, spacing,
        // border, size, and opacity fields that React Native ViewStyle supports.
        toUniversalButtonStyle(tokens, fullWidth ?? false, isDisabled) as ViewStyle,
        pressed ? styles.androidPressed : undefined,
      ]}
    >
      {renderAndroidButtonContent({ loading: loading ?? false, icon, iconPosition, label, tokens })}
    </Pressable>
  );
}

function renderAndroidButtonContent({
  loading,
  icon,
  iconPosition,
  label,
  tokens,
}: Pick<ButtonProps, "loading" | "icon" | "iconPosition" | "label"> & {
  tokens: ReturnType<typeof getButtonTokens>;
}) {
  if (loading) return <ActivityIndicator size="small" color={tokens.indicatorColor} />;

  return (
    <View style={styles.androidContent}>
      {icon && iconPosition === "left" ? icon : null}
      <RNText style={[styles.androidLabel, { color: tokens.textColor }]}>{label}</RNText>
      {icon && iconPosition === "right" ? icon : null}
    </View>
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
  accessibilityLabel,
  style,
  testID,
}: ButtonProps) {
  const { theme } = useUnistyles();
  const isDisabled = resolveDisabled(disabled, loading);
  const tokens = getButtonTokens(variant, size, theme);

  if (Platform.OS === "android") {
    return (
      <AndroidButton
        {...{
          label,
          icon,
          iconPosition,
          fullWidth,
          disabled,
          loading,
          onPress,
          accessibilityLabel,
          style,
          testID,
          tokens,
        }}
      />
    );
  }

  return (
    <View
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
      style={getContainerStyle(fullWidth, style)}
    >
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

const styles = {
  androidButton: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  androidContent: {
    alignItems: "center" as const,
    flexDirection: "row" as const,
    gap: 8,
    justifyContent: "center" as const,
  },
  androidLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  androidPressed: {
    opacity: 0.8,
  },
};
