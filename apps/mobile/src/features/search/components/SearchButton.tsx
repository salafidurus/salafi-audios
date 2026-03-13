import { Pressable, Text } from "react-native";
import { Search } from "lucide-react-native";
import { StyleSheet } from "react-native-unistyles";
import { useRouter } from "expo-router";

export type SearchButtonProps = {
  placeholder?: string;
};

export function SearchButton({ placeholder = "Search..." }: SearchButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push("/(tabs)/(search)/searchprocessing" as const);
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Search size={20} color={styles.icon.color} strokeWidth={2} />
      <Text style={styles.placeholder}>{placeholder}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.component.gapLg,
    backgroundColor: theme.colors.surface.subtle,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.component.chip,
    paddingHorizontal: theme.spacing.scale.lg,
    paddingVertical: theme.spacing.scale.md,
  },
  icon: {
    color: theme.colors.content.muted,
  },
  placeholder: {
    flex: 1,
    fontFamily: theme.typography.bodyMd.fontFamily,
    fontSize: theme.typography.bodyMd.fontSize,
    lineHeight: theme.typography.bodyMd.lineHeight,
    letterSpacing: theme.typography.bodyMd.letterSpacing,
    color: theme.colors.content.muted,
  },
}));
