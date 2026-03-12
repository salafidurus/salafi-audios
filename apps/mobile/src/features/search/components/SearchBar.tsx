import { TextInput, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export type SearchBarProps = {
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function SearchBar({ placeholder, value, onChange }: SearchBarProps) {
  const placeholderColor = styles.placeholder.color;

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <View style={styles.iconLens} />
        <View style={styles.iconHandle} />
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.component.gapMd,
    backgroundColor: theme.colors.surface.subtle,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.component.chip,
    paddingHorizontal: theme.spacing.scale.md,
    paddingVertical: theme.spacing.scale.sm,
  },
  iconWrapper: {
    position: "relative",
    width: theme.spacing.scale.lg,
    height: theme.spacing.scale.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  iconLens: {
    position: "absolute",
    width: theme.spacing.scale.md,
    height: theme.spacing.scale.md,
    borderRadius: theme.radius.scale.sm,
    borderWidth: 2,
    borderColor: theme.colors.content.muted,
  },
  iconHandle: {
    position: "absolute",
    width: theme.spacing.scale.xs,
    height: theme.spacing.scale.xs,
    bottom: 0,
    right: -2,
    borderRadius: theme.radius.scale.xs,
    backgroundColor: theme.colors.content.muted,
    transform: [{ rotate: "45deg" }],
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.bodyMd.fontFamily,
    fontSize: theme.typography.bodyMd.fontSize,
    lineHeight: theme.typography.bodyMd.lineHeight,
    letterSpacing: theme.typography.bodyMd.letterSpacing,
    padding: 0,
    color: theme.colors.content.default,
  },
  placeholder: {
    color: theme.colors.content.muted,
  },
}));
