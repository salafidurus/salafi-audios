"use client";

import { ActivityIndicator, type GestureResponderEvent, type PressableProps } from "react-native";
import { useState } from "react";
import { View } from "react-native-unistyles/components/native/View";
import { Text } from "react-native-unistyles/components/native/Text";
import { Pressable } from "react-native-unistyles/components/native/Pressable";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import type { ViewStyle } from "react-native";
import { AccentGradientFill } from "../AccentGradientFill/AccentGradientFill";

type ButtonVariant = "primary" | "surface" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonMobileWebProps = Omit<PressableProps, "style"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function ButtonMobileWeb({
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
}: ButtonMobileWebProps) {
  const { theme } = useUnistyles();
  const [isPressed, setIsPressed] = useState(false);
  const isDisabled = disabled || loading;

  return (
    <View
      style={{
        alignSelf: fullWidth ? "stretch" : "flex-start",
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPressIn={(e: GestureResponderEvent) => {
          setIsPressed(true);
          onPressIn?.(e);
        }}
        onPressOut={(e: GestureResponderEvent) => {
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
        {variant === "primary" ? (
          <AccentGradientFill
            borderRadius={theme.radius.component.chip}
            linearColors={theme.recipes.primaryCta.linear.colors}
            linearStart={theme.recipes.primaryCta.linear.start}
            linearEnd={theme.recipes.primaryCta.linear.end}
            radialCenter={theme.recipes.primaryCta.radial.center}
            radialRadius={theme.recipes.primaryCta.radial.radius}
            radialCenterColor={theme.recipes.primaryCta.radial.centerColor}
            radialEdgeColor={theme.recipes.primaryCta.radial.edgeColor}
          />
        ) : null}
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
    </View>
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
        backgroundColor: t.recipes.primaryCta.backgroundColor,
        borderColor: t.recipes.primaryCta.borderColor,
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

function getIndicatorColor(variant: ButtonVariant, t: Theme) {
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
        paddingVertical: "0.625rem",
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
