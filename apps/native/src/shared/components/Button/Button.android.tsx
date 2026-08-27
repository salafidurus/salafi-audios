import { Host } from "@expo/ui";
import {
  Button as FilledButton,
  OutlinedButton,
  TextButton,
  Text as ComposeText,
  Spacer,
  type ButtonProps as ComposeButtonProps,
} from "@expo/ui/jetpack-compose";
import {
  border,
  height,
  testID as testIDModifier,
  width,
  type ModifierConfig,
} from "@expo/ui/jetpack-compose/modifiers";
import {
  ActivityIndicator,
  type DimensionValue,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { getButtonTokens, type ButtonSize, type ButtonVariant } from "./button.tokens";

type TextFontWeight =
  | "normal"
  | "bold"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900";

const FULL_WIDTH: DimensionValue = "100%";

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

// Material3's `colors` prop is the documented mechanism for overriding a
// button's fill/content color without fighting its default chrome — unlike
// SwiftUI's buttonStyle, it doesn't also own padding/shape, so layering a
// border modifier on top doesn't double up the way it did on iOS.
const VARIANT_COMPONENT = {
  primary: FilledButton,
  surface: FilledButton,
  outline: OutlinedButton,
  ghost: TextButton,
  danger: FilledButton,
} satisfies Record<ButtonVariant, typeof FilledButton | typeof OutlinedButton | typeof TextButton>;

function buildModifiers(t: ReturnType<typeof getButtonTokens>, testID?: string): ModifierConfig[] {
  const modifiers: ModifierConfig[] = [height(t.height)];
  if (t.borderWidth && t.borderColor) modifiers.push(border(t.borderWidth, t.borderColor));
  if (testID) modifiers.push(testIDModifier(testID));
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
  const ButtonComponent = VARIANT_COMPONENT[variant];

  const modifiers = buildModifiers(t, testID);

  const colors: ComposeButtonProps["colors"] = {
    containerColor: t.backgroundColor,
    contentColor: t.textColor,
    disabledContainerColor: t.backgroundColor,
    disabledContentColor: t.textColor,
  };

  return (
    <Host matchContents={!fullWidth} style={[fullWidth && base.stretch, style]}>
      <ButtonComponent
        onClick={isDisabled ? undefined : onPress}
        enabled={!isDisabled}
        colors={colors}
        contentPadding={{ start: t.paddingHorizontal, end: t.paddingHorizontal, top: 0, bottom: 0 }}
        modifiers={modifiers}
      >
        {loading ? (
          <ActivityIndicator size="small" color={t.indicatorColor} />
        ) : (
          <>
            {icon && iconPosition === "left" ? (
              <>
                {icon}
                <Spacer modifiers={[width(t.gap)]} />
              </>
            ) : null}
            <ComposeText
              color={getComposeTextColor(t.labelStyle.color, t.textColor)}
              style={{
                fontSize: t.labelStyle.fontSize,
                fontWeight: mapFontWeight(t.labelStyle.fontWeight),
              }}
            >
              {label}
            </ComposeText>
            {icon && iconPosition === "right" ? (
              <>
                <Spacer modifiers={[width(t.gap)]} />
                {icon}
              </>
            ) : null}
          </>
        )}
      </ButtonComponent>
    </Host>
  );
}

const base = {
  stretch: { width: FULL_WIDTH },
};

function mapFontWeight(weight: TextStyle["fontWeight"] | undefined): TextFontWeight {
  const str = String(weight ?? "400");
  switch (str) {
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
      return str;
    default:
      return "400";
  }
}

function getComposeTextColor(color: TextStyle["color"], fallback: string): string {
  return color !== undefined && color !== null ? String(color) : fallback;
}
