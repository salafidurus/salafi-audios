import { View, Text, FlatList, Pressable } from "react-native";
import type { ListRenderItemInfo } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ContentSuggestionDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { useShowOriginalContent } from "@/features/i18n/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";

export type FeedTopicRowProps = {
  topicName: string;
  items: ContentSuggestionDto[];
  onItemPress?: (slug: string) => void;
};

export function FeedTopicRow({ topicName, items, onItemPress }: FeedTopicRowProps) {
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();

  if (!items.length) return null;

  function renderItem({ item }: ListRenderItemInfo<ContentSuggestionDto>) {
    const title = pickContentField(item.title, item.original?.title, showOriginal);
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => onItemPress?.(item.slug)}
      >
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.scholar}>{item.scholarName}</Text>
        {item.durationSeconds ? (
          <Text style={styles.duration}>{Math.floor(item.durationSeconds / 60)}m</Text>
        ) : null}
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {t("feed.newInTopic", "New in {{topic}}", { topic: topicName })}
      </Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginStart: 8,
    color: theme.colors.content.strong,
  },
  listContent: {
    paddingHorizontal: 8,
    gap: 12,
  },
  card: {
    minWidth: 200,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: 8,
    backgroundColor: theme.colors.surface.default,
  },
  cardPressed: {
    backgroundColor: theme.colors.surface.subtle,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    lineHeight: 20,
    color: theme.colors.content.strong,
  },
  scholar: {
    fontSize: 12,
    color: theme.colors.content.muted,
    marginBottom: 4,
  },
  duration: {
    fontSize: 12,
    color: theme.colors.content.muted,
  },
}));
