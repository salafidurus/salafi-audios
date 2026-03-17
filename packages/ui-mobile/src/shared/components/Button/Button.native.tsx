import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { useUnistyles } from "react-native-unistyles";
import { EaseView } from "react-native-ease";
import { useState } from "react";

type ButtonVariant = "primary" | "surface" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = PressableProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
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
  onPressIn,
  onPressOut,
  style,
  ...props
}: ButtonProps) {
  const { theme } = useUnistyles();
  const [isPressed, setIsPressed] = useState(false);

  const isDisabled = disabled || loading;

  return (
    <EaseView
      animate={{
        scale: isPressed ? 0.97 : 1,
        opacity: isPressed ? 0.88 : 1,
      }}
      transition={{
        type: "spring",
        damping: 10,
        stiffness: 100,
      }}
      style={[fullWidth ? base.stretch : base.shrink, isDisabled && base.disabled]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPressIn={(e) => {
          setIsPressed(true);
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          setIsPressed(false);
          onPressOut?.(e);
        }}
        style={[
          base.pressable,
          { borderRadius: theme.radius.component.chip },
          getVariantContainer(variant, theme),
          getSizeContainer(size, theme),
          fullWidth && base.stretch,
          style as ViewStyle,
        ]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator size="small" color={getIndicatorColor(variant, theme)} />
        ) : (
          <>
            {icon && iconPosition === "left" && icon}
            <Text style={[base.label, getVariantLabel(variant, theme), getSizeLabel(size, theme)]}>
              {label}
            </Text>
            {icon && iconPosition === "right" && icon}
          </>
        )}
      </Pressable>
    </EaseView>
  );
}

const base = StyleSheet.create({
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  label: {
    textAlign: "center",
  },
  shrink: {
    alignSelf: "flex-start",
  },
  stretch: {
    alignSelf: "stretch",
  },
  disabled: {
    opacity: 0.5,
  },
});

type Theme = ReturnType<typeof useUnistyles>["theme"];

function getVariantContainer(variant: ButtonVariant, t: Theme): ViewStyle {
  switch (variant) {
    case "primary":
      return {
        backgroundColor: t.colors.action.primary,
        borderColor: t.colors.border.primaryStrong,
        ...t.shadows.sm,
      };
    case "surface":
      return {
        backgroundColor: t.colors.surface.elevated,
        borderColor: t.colors.border.default,
        ...t.shadows.xs,
      };
    case "outline":
      return { backgroundColor: "transparent", borderColor: t.colors.border.default };
    case "ghost":
      return { backgroundColor: "transparent", borderColor: "transparent" };
    case "danger":
      return {
        backgroundColor: t.colors.action.danger,
        borderColor: t.colors.state.dangerBorder,
        ...t.shadows.sm,
      };
  }
}

function getVariantLabel(variant: ButtonVariant, t: Theme): TextStyle {
  switch (variant) {
    case "primary":
      return { color: t.colors.content.onPrimary };
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
      return t.colors.content.onPrimary;
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

function getSizeContainer(size: ButtonSize, t: Theme): ViewStyle {
  switch (size) {
    case "sm":
      return {
        paddingVertical: t.spacing.component.chipY,
        paddingHorizontal: t.spacing.component.chipX,
        gap: t.spacing.component.gapSm,
      };
    case "md":
      return {
        paddingVertical: t.spacing.scale.sm + 2,
        paddingHorizontal: t.spacing.scale.lg,
        gap: t.spacing.component.gapSm,
      };
    case "lg":
      return {
        paddingVertical: t.spacing.scale.md,
        paddingHorizontal: t.spacing.scale.xl,
        gap: t.spacing.component.gapMd,
      };
  }
}

function getSizeLabel(size: ButtonSize, t: Theme): TextStyle {
  switch (size) {
    case "sm":
      return t.typography.bodySm as TextStyle;
    case "md":
      return t.typography.labelMd as TextStyle;
    case "lg":
      return t.typography.bodyLg as TextStyle;
  }
}
