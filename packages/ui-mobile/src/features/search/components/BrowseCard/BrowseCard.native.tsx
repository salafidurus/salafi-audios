import { useState } from "react";
import { Pressable, Text } from "react-native";
import { EaseView } from "react-native-ease";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export type BrowseCardProps = {
  name: string;
  onPress?: (name: string) => void;
};

export function BrowseCard({ name, onPress }: BrowseCardProps) {
  const { theme } = useUnistyles();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <EaseView
      animate={{
        scale: isPressed ? 0.95 : 1,
      }}
      transition={{ type: "spring", damping: 10, stiffness: 150 }}
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
    </EaseView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.component.card,
    paddingVertical: theme.spacing.component.gapLg,
    paddingHorizontal: theme.spacing.component.cardPadding,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  pressable: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    ...theme.typography.labelMd,
    color: theme.colors.content.default,
    textAlign: "center",
  },
}));
