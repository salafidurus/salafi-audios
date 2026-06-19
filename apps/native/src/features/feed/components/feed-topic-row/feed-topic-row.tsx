import { View, Text, FlatList, Pressable } from "react-native";
import type { ListRenderItemInfo } from "react-native";
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
        style={({ pressed }) => [
          {
            minWidth: 200,
            padding: 12,
            borderWidth: 1,
            borderColor: "#e0e0e0",
            borderRadius: 8,
            backgroundColor: "#fff",
          },
          pressed && { backgroundColor: "#f5f5f5" },
        ]}
        onPress={() => onItemPress?.(item.slug)}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            marginBottom: 4,
            lineHeight: 20,
          }}
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: "#666",
            marginBottom: 4,
          }}
        >
          {item.scholarName}
        </Text>
        {item.durationSeconds && (
          <Text style={{ fontSize: 12, color: "#999" }}>
            {Math.floor(item.durationSeconds / 60)}m
          </Text>
        )}
      </Pressable>
    );
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 12,
          marginStart: 8,
          color: "#333",
        }}
      >
        {t("feed.newInTopic", "New in {{topic}}", { topic: topicName })}
      </Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8, gap: 12 }}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}
