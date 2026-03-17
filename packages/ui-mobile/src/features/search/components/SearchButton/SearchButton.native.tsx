import React, { useState } from "react";
import { Pressable, Text } from "react-native";
import { Search as SearchIcon } from "lucide-react-native";
import { EaseView } from "react-native-ease";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

// moduleSuffixes causes lucide types to resolve react-native-svg web types (missing color prop)
const Search = SearchIcon as React.ComponentType<{ size: number; color: string }>;

export type SearchButtonProps = {
  placeholder?: string;
  onPress?: () => void;
};

export function SearchButton({ placeholder = "Search...", onPress }: SearchButtonProps) {
  const { theme } = useUnistyles();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <EaseView
      animate={{
        scale: isPressed ? 0.97 : 1,
      }}
      transition={{ type: "spring", damping: 10, stiffness: 100 }}
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
    </EaseView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.component.panelSm,
    paddingHorizontal: theme.spacing.scale.lg,
    paddingVertical: theme.spacing.scale.md,
  },
  pressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.component.gapSm,
  },
  placeholder: {
    flex: 1,
    ...theme.typography.bodyMd,
    color: theme.colors.content.muted,
  },
}));
