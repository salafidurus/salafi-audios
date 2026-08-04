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
import { ActivityIndicator, type StyleProp, type ViewStyle } from "react-native";
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

const VARIANT_COMPONENT: Record<
  ButtonVariant,
  typeof FilledButton | typeof OutlinedButton | typeof TextButton
> = {
  primary: FilledButton,
  surface: FilledButton,
  outline: OutlinedButton,
  ghost: TextButton,
  danger: FilledButton,
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
  const ButtonComponent = VARIANT_COMPONENT[variant];

  const modifiers: ModifierConfig[] = [height(t.height)];
  if (t.borderWidth && t.borderColor) {
    modifiers.push(border(t.borderWidth, t.borderColor));
  }
  if (testID) {
    modifiers.push(testIDModifier(testID));
  }

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
              color={t.labelStyle.color as string}
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
  stretch: { alignSelf: "stretch" } as ViewStyle,
};

const VALID_FONT_WEIGHTS = new Set<TextFontWeight>([
  "normal",
  "bold",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
]);

function mapFontWeight(weight: unknown): TextFontWeight {
  const str = String(weight ?? "400") as TextFontWeight;
  return VALID_FONT_WEIGHTS.has(str) ? str : "400";
}
