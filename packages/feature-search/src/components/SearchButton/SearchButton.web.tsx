"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Pressable } from "react-native-unistyles/components/native/Pressable";
import { Text } from "react-native-unistyles/components/native/Text";
import { View } from "react-native-unistyles/components/native/View";

export type SearchButtonProps = {
  placeholder?: string;
  onPress?: () => void;
};

export function SearchButton({ placeholder = "Search...", onPress }: SearchButtonProps) {
  const { theme } = useUnistyles();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isPressed ? theme.colors.surface.hover : theme.colors.surface.default,
        },
      ]}
    >
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
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.component.panelSm,
    _web: {
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
    color: theme.colors.content.muted,
    _web: {
      ...theme.typography.bodyMd,
      lineHeight: String(theme.typography.bodyMd.lineHeight),
    },
  },
}));
