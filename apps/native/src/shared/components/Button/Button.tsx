import type { UniversalStyle } from "@expo/ui";

import { Host, Button as NativeButton } from "@expo/ui";
import {
  ActivityIndicator,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useUnistyles } from "react-native-unistyles";

type ButtonVariant = "primary" | "surface" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

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

  return (
    <Host matchContents={!fullWidth} style={[fullWidth && base.stretch, style]}>
      <NativeButton
        // Always "text" (plain): "filled"/"outlined" map to SwiftUI's real
        // borderedProminent/bordered button styles, which paint their own
        // background/padding chrome that visually clashes with (and double-pads
        // against) our own backgroundColor/border/padding below. Plain has none,
        // so our style is the sole source of the button's appearance.
        variant="text"
        onPress={onPress}
        disabled={isDisabled}
        testID={testID}
        style={getNativeButtonStyle(variant, size, theme)}
      >
        <View style={[base.content, getGapStyle(size, theme)]}>
          {loading ? (
            <ActivityIndicator size="small" color={getIndicatorColor(variant, theme)} />
          ) : (
            <>
              {icon && iconPosition === "left" ? icon : null}
              <Text style={[getLabelStyle(variant, theme), getSizeLabelStyle(size, theme)]}>
                {label}
              </Text>
              {icon && iconPosition === "right" ? icon : null}
            </>
          )}
        </View>
      </NativeButton>
    </Host>
  );
}

const base = {
  stretch: { width: "100%" } as ViewStyle,
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
};

type Theme = ReturnType<typeof useUnistyles>["theme"];

function getNativeButtonStyle(variant: ButtonVariant, size: ButtonSize, t: Theme): UniversalStyle {
  return {
    ...getVariantStyle(variant, t),
    ...getSizeStyle(size, t),
    borderRadius: t.radius.component.chip,
  };
}

function getVariantStyle(variant: ButtonVariant, t: Theme): UniversalStyle {
  switch (variant) {
    case "primary":
      return {
        backgroundColor: t.recipes.primaryCta.backgroundColor,
        borderColor: t.recipes.primaryCta.borderColor,
        borderWidth: 1,
      };
    case "surface":
      return {
        backgroundColor: t.colors.surface.elevated,
        borderColor: t.colors.border.default,
        borderWidth: 1,
      };
    case "outline":
      return {
        backgroundColor: "transparent",
        borderColor: t.colors.border.default,
        borderWidth: 1.5,
      };
    case "ghost":
      return { backgroundColor: "transparent", borderColor: "transparent", borderWidth: 0 };
    case "danger":
      return {
        backgroundColor: t.colors.action.danger,
        borderColor: t.colors.state.dangerBorder,
        borderWidth: 1,
      };
  }
}

function getLabelStyle(variant: ButtonVariant, t: Theme): TextStyle {
  switch (variant) {
    case "primary":
      return { color: t.recipes.primaryCta.textColor };
    case "surface":
      return { color: t.colors.content.default };
    case "outline":
      return { color: t.colors.content.default };
    case "ghost":
      return { color: t.colors.content.primary };
    case "danger":
      return { color: t.colors.content.onDanger };
  }
}

function getIndicatorColor(variant: ButtonVariant, t: Theme): string {
  switch (variant) {
    case "primary":
      return t.recipes.primaryCta.textColor;
    case "surface":
      return t.colors.content.muted;
    case "outline":
      return t.colors.content.muted;
    case "ghost":
      return t.colors.content.primary;
    case "danger":
      return t.colors.content.onDanger;
  }
}

function getSizeStyle(size: ButtonSize, t: Theme): UniversalStyle {
  switch (size) {
    case "sm":
      return {
        paddingVertical: t.spacing.component.chipY,
        paddingHorizontal: t.spacing.component.chipX,
      };
    case "md":
      return {
        paddingVertical: t.spacing.scale.sm + 2,
        paddingHorizontal: t.spacing.scale.lg,
      };
    case "lg":
      return {
        paddingVertical: t.spacing.scale.md,
        paddingHorizontal: t.spacing.scale.xl,
      };
  }
}

function getGapStyle(size: ButtonSize, t: Theme): ViewStyle {
  switch (size) {
    case "sm":
      return { gap: t.spacing.component.gapSm };
    case "md":
      return { gap: t.spacing.component.gapSm };
    case "lg":
      return { gap: t.spacing.component.gapMd };
  }
}

function getSizeLabelStyle(size: ButtonSize, t: Theme): TextStyle {
  switch (size) {
    case "sm":
      return t.typography.bodySm as TextStyle;
    case "md":
      return t.typography.labelMd as TextStyle;
    case "lg":
      return t.typography.bodyLg as TextStyle;
  }
}
