"use client";

import { useState } from "react";
import { View } from "react-native-unistyles/components/native/View";
import { Text } from "react-native-unistyles/components/native/Text";
import { Pressable } from "react-native-unistyles/components/native/Pressable";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export type BrowseCardProps = {
  name: string;
  onPress?: (name: string) => void;
};

export function BrowseCard({ name, onPress }: BrowseCardProps) {
  const { theme } = useUnistyles();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isPressed ? theme.colors.surface.hover : theme.colors.surface.default,
          borderColor: isPressed ? theme.colors.border.primary : theme.colors.border.default,
        },
      ]}
    >
      <Pressable
        onPress={() => onPress?.(name)}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={styles.pressable}
      >
        <Text style={styles.name}>{name}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.component.card,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
    _web: {
      paddingVertical: theme.spacing.component.gapLg,
      paddingHorizontal: theme.spacing.component.cardPadding,
    },
  },
  pressable: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    color: theme.colors.content.default,
    textAlign: "center",
    _web: {
      ...theme.typography.labelMd,
      lineHeight: String(theme.typography.labelMd.lineHeight),
    },
  },
}));
