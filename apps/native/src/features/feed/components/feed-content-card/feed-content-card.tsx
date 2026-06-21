import { Text, Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { FeedContentItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { useShowOriginalContent } from "@/features/i18n/content-preference";

export type FeedContentCardProps = {
  item: FeedContentItemDto;
  onPress?: () => void;
};

export function FeedContentCard({ item, onPress }: FeedContentCardProps) {
  const showOriginal = useShowOriginalContent();
  const title = pickContentField(item.title, item.original?.title, showOriginal);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>
        {item.scholarName}
        {item.kind !== "single" ? ` · ${item.kind}` : ""}
      </Text>
      <Text style={styles.sub}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {item.publishedAt ? ` · ${new Date(item.publishedAt).toLocaleDateString()}` : ""}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: 12,
    backgroundColor: theme.colors.surface.default,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
  },
  cardPressed: {
    backgroundColor: theme.colors.surface.subtle,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.content.strong,
  },
  meta: {
    fontSize: 12,
    color: theme.colors.content.muted,
    marginTop: 2,
  },
  sub: {
    fontSize: 12,
    color: theme.colors.content.subtle,
    marginTop: 2,
  },
}));
