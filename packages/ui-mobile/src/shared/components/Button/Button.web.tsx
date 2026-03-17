import { motion } from "framer-motion";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from "react-native";
import { useUnistyles } from "react-native-unistyles";
import type { ViewStyle } from "react-native";

type ButtonVariant = "primary" | "surface" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<PressableProps, "style"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  style?: ViewStyle;
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
    <motion.div
      animate={{ scale: isPressed ? 0.97 : 1, opacity: isPressed ? 0.88 : 1 }}
      transition={{ type: "spring", damping: 10, stiffness: 100 }}
      style={{ alignSelf: fullWidth ? "stretch" : "flex-start", opacity: isDisabled ? 0.5 : 1 }}
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
          styles.pressable,
          { borderRadius: theme.radius.component.chip },
          getVariantContainer(variant, theme),
          getSizeContainer(size, theme),
          fullWidth && styles.stretch,
          style,
        ]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator size="small" color={getIndicatorColor(variant, theme)} />
        ) : (
          <>
            {icon && iconPosition === "left" && icon}
            <Text
              style={[styles.label, getVariantLabel(variant, theme), getSizeLabel(size, theme)]}
            >
              {label}
            </Text>
            {icon && iconPosition === "right" && icon}
          </>
        )}
      </Pressable>
    </motion.div>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  stretch: {
    alignSelf: "stretch",
  },
  label: {
    textAlign: "center",
  },
});

type Theme = ReturnType<typeof useUnistyles>["theme"];

function getVariantContainer(variant: ButtonVariant, t: Theme) {
  switch (variant) {
    case "primary":
      return {
        backgroundColor: t.colors.action.primary,
        borderColor: t.colors.border.primaryStrong,
      };
    case "surface":
      return {
        backgroundColor: t.colors.surface.elevated,
        borderColor: t.colors.border.default,
      };
    case "outline":
      return { backgroundColor: "transparent", borderColor: t.colors.border.default };
    case "ghost":
      return { backgroundColor: "transparent", borderColor: "transparent" };
    case "danger":
      return {
        backgroundColor: t.colors.action.danger,
        borderColor: t.colors.state.dangerBorder,
      };
  }
}

function getVariantLabel(variant: ButtonVariant, t: Theme) {
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

function getIndicatorColor(variant: ButtonVariant, t: Theme) {
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
      } as unknown as ViewStyle;
    case "md":
      return {
        paddingVertical: "0.625rem", // t.spacing.scale.sm (0.5rem) + 0.125rem
        paddingHorizontal: t.spacing.scale.lg,
        gap: t.spacing.component.gapSm,
      } as unknown as ViewStyle;
    case "lg":
      return {
        paddingVertical: t.spacing.scale.md,
        paddingHorizontal: t.spacing.scale.xl,
        gap: t.spacing.component.gapMd,
      } as unknown as ViewStyle;
  }
}

function getSizeLabel(size: ButtonSize, t: Theme) {
  switch (size) {
    case "sm":
      return t.typography.bodySm as any;
    case "md":
      return t.typography.labelMd as any;
    case "lg":
      return t.typography.bodyLg as any;
  }
}
