import { Pressable, Text, View } from "react-native";
import { Search } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import type { ComponentType } from "react";
import { AccentGradientFill } from "@sd/shared";

export type SearchButtonProps = {
  placeholder?: string;
  onPress?: () => void;
};

export function SearchButton({ placeholder = "Search...", onPress }: SearchButtonProps) {
  const { theme } = useUnistyles();
  const recipe = theme.recipes.primarySubtleSurface;
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
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.recipes.primarySubtleSurface.borderColor,
    borderRadius: theme.radius.component.panelSm,
    backgroundColor: theme.recipes.primarySubtleSurface.backgroundColor,
    paddingHorizontal: theme.spacing.scale.lg,
    paddingVertical: theme.spacing.scale.md,
    ...theme.shadows.xs,
  },
  pressed: {
    opacity: 0.88,
  },
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.component.gapSm,
  },
  placeholder: {
    flexShrink: 1,
    color: theme.recipes.primarySubtleSurface.textColor,
    ...theme.typography.bodyMd,
  },
}));
