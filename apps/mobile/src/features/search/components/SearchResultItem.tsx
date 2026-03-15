import { Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { EaseView } from "react-native-ease";
import { useState } from "react";

export type SearchResultKind = "lecture" | "series" | "collection";

export type SearchResultItemProps = {
  kind: SearchResultKind;
  title: string;
  description?: string;
  onPress?: () => void;
};

export function SearchResultItem({ kind, title, description, onPress }: SearchResultItemProps) {
  const { theme } = useUnistyles();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <EaseView
      animate={{ scale: isPressed ? 0.97 : 1, opacity: isPressed ? 0.92 : 1 }}
      transition={{ type: "spring", damping: 10, stiffness: 120 }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: pressed ? theme.colors.surface.hover : theme.colors.surface.default },
        ]}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.kindPill,
              {
                backgroundColor: theme.colors.surface.primarySubtle,
                borderColor: theme.colors.border.primary,
              },
            ]}
          >
            <Text style={[styles.kindText, { color: theme.colors.content.primaryStrong }]}>
              {kind}
            </Text>
          </View>
        </View>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </Pressable>
    </EaseView>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.component.card,
    padding: theme.spacing.component.cardPadding,
    gap: theme.spacing.component.gapSm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kindPill: {
    borderWidth: 1,
    borderRadius: theme.radius.component.chip,
    paddingHorizontal: theme.spacing.component.chipX,
    paddingVertical: theme.spacing.component.chipY,
  },
  kindText: {
    ...theme.typography.labelMd,
    textTransform: "capitalize",
  },
  title: {
    ...theme.typography.titleMd,
    color: theme.colors.content.strong,
  },
  description: {
    ...theme.typography.bodySm,
    color: theme.colors.content.muted,
  },
}));
