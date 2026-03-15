import { Pressable, Text } from "react-native";
import { Search } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useRouter } from "expo-router";
import { EaseView } from "react-native-ease";
import { useState } from "react";

export type SearchButtonProps = {
  placeholder?: string;
};

export function SearchButton({ placeholder = "Search..." }: SearchButtonProps) {
  const router = useRouter();
  const { theme } = useUnistyles();
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    router.push("/(tabs)/(search)/searchprocessing" as const);
  };

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
        onPress={handlePress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={styles.pressable}
      >
        <Search
          size={20}
          color={isPressed ? theme.colors.content.primary : theme.colors.content.muted}
          strokeWidth={2}
        />
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
    fontFamily: theme.typography.bodyMd.fontFamily,
    fontSize: theme.typography.bodyMd.fontSize,
    lineHeight: theme.typography.bodyMd.lineHeight,
    letterSpacing: theme.typography.bodyMd.letterSpacing,
    color: theme.colors.content.muted,
  },
}));
