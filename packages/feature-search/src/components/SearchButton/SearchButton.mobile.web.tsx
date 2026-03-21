"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Pressable } from "react-native-unistyles/components/native/Pressable";
import { Text } from "react-native-unistyles/components/native/Text";
import { View } from "react-native-unistyles/components/native/View";
import { AccentGradientFill } from "@sd/shared";

export type SearchButtonMobileWebProps = {
  placeholder?: string;
  onPress?: () => void;
};

export function SearchButtonMobileWeb({
  placeholder = "Search...",
  onPress,
}: SearchButtonMobileWebProps) {
  const { theme } = useUnistyles();
  const [isPressed, setIsPressed] = useState(false);
  const recipe = theme.recipes.primarySubtleSurface;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: recipe.backgroundColor,
          opacity: isPressed ? 0.9 : 1,
        },
      ]}
    >
      <AccentGradientFill
        borderRadius={theme.radius.component.panelSm}
        linearColors={recipe.linear.colors}
        linearStart={recipe.linear.start}
        linearEnd={recipe.linear.end}
        radialCenter={recipe.radial.center}
        radialRadius={recipe.radial.radius}
        radialCenterColor={recipe.radial.centerColor}
        radialEdgeColor={recipe.radial.edgeColor}
      />
      <Pressable
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={styles.pressable}
      >
        <Search size={20} color={theme.colors.content.muted} />
        <Text style={styles.placeholder}>{placeholder}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.recipes.primarySubtleSurface.borderColor,
    borderRadius: theme.radius.component.panelSm,
    _web: {
      boxShadow: theme.shadows.xs,
      paddingHorizontal: theme.spacing.scale.lg,
      paddingVertical: theme.spacing.scale.md,
    },
  },
  pressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.component.gapSm,
  },
  placeholder: {
    flex: 1,
    color: theme.recipes.primarySubtleSurface.textColor,
    _web: {
      ...(theme.typography.bodyMd as Record<string, string | number>),
      lineHeight: String(theme.typography.bodyMd.lineHeight),
    },
  },
}));
