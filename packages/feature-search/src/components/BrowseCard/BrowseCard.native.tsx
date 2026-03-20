import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export type BrowseCardProps = {
  name: string;
  onPress?: (name: string) => void;
};

export function BrowseCard({ name, onPress }: BrowseCardProps) {
  return (
    <Pressable
      onPress={() => onPress?.(name)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.inner}>
        <Text style={styles.name}>{name}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    minHeight: 100,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.component.card,
    backgroundColor: theme.colors.surface.default,
    paddingVertical: theme.spacing.component.gapLg,
    paddingHorizontal: theme.spacing.component.cardPadding,
  },
  pressed: {
    backgroundColor: theme.colors.surface.hover,
    borderColor: theme.colors.border.primary,
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    color: theme.colors.content.default,
    textAlign: "center",
    ...theme.typography.labelMd,
  },
}));
