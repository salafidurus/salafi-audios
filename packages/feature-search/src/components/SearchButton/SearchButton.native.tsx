import { Pressable, Text, View } from "react-native";
import { Search } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import type { ComponentType } from "react";

export type SearchButtonProps = {
  placeholder?: string;
  onPress?: () => void;
};

export function SearchButton({ placeholder = "Search...", onPress }: SearchButtonProps) {
  const { theme } = useUnistyles();
  const SearchIcon = Search as ComponentType<{
    size?: number;
    strokeWidth?: number;
    color?: string;
  }>;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <SearchIcon size={20} color={theme.colors.content.muted} />
        <Text style={styles.placeholder}>{placeholder}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.component.panelSm,
    backgroundColor: theme.colors.surface.default,
    paddingHorizontal: theme.spacing.scale.lg,
    paddingVertical: theme.spacing.scale.md,
  },
  pressed: {
    backgroundColor: theme.colors.surface.hover,
  },
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.component.gapSm,
  },
  placeholder: {
    flexShrink: 1,
    color: theme.colors.content.muted,
    ...theme.typography.bodyMd,
  },
}));
