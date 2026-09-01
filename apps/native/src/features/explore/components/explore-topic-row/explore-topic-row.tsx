import type { ContentSuggestionDto } from "@sd/core-contracts";
import type { ListRenderItemInfo } from "react-native";

import { pickContentField } from "@sd/core-i18n";
import { useFormattedScholarName } from "@sd/domain-content";
import { useCallback } from "react";
import { FlatList, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { MarqueeText } from "@/shared/components/MarqueeText";
import { AppText } from "@/shared/ui";

/** Describes the inputs and callbacks accepted by Explore Topic Row. */
/** Describes the inputs, callbacks, and optional state accepted by Explore Topic Row. */
export type ExploreTopicRowProps = {
  topicName: string;
  items: ContentSuggestionDto[];
  onItemPress?: (slug: string) => void;
};

type TopicCardProps = {
  item: ContentSuggestionDto;
  showOriginal: boolean;
  onItemPress?: (slug: string) => void;
};

function TopicCard({ item, showOriginal, onItemPress }: TopicCardProps) {
  const title = pickContentField(item.title, item.original?.title, showOriginal);
  const scholarName = useFormattedScholarName(item.scholarName, item.scholarSlug);
  return (
    <Pressable
      onPress={() => onItemPress?.(item.slug)}
      style={styles.card}
      testID={`topic-card-${item.slug}`}
    >
      <View style={styles.cardContent}>
        <AppText variant="bodySm" style={styles.title} numberOfLines={2}>
          {title}
        </AppText>
        <MarqueeText text={scholarName} variant="caption" style={styles.scholar} />
        {item.durationSeconds ? (
          <AppText variant="caption" style={styles.duration}>
            {Math.floor(item.durationSeconds / 60)}m
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

/** Renders the native explore topic row surface and coordinates its user-facing state. */
export function ExploreTopicRow({ topicName, items, onItemPress }: ExploreTopicRowProps) {
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ContentSuggestionDto>) => (
      <TopicCard item={item} showOriginal={showOriginal} onItemPress={onItemPress} />
    ),
    [showOriginal, onItemPress],
  );

  if (!items.length) return null;

  return (
    <View style={styles.container}>
      <AppText variant="titleMd" style={styles.heading}>
        {t("feed.newInTopic", "New in {{topic}}", { topic: topicName })}
      </AppText>
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
    marginBottom: theme.spacing.scale.lg,
  },
  heading: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: theme.spacing.scale.md,
    marginStart: theme.spacing.scale.sm,
    color: theme.colors.content.strong,
  },
  listContent: {
    paddingHorizontal: theme.spacing.scale.sm,
    gap: theme.spacing.scale.md,
  },
  card: {
    minWidth: 200,
    padding: theme.spacing.scale.md,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.component.panel,
    backgroundColor: theme.colors.surface.default,
  },
  cardContent: {
    gap: theme.spacing.scale.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: theme.spacing.scale.xs,
    lineHeight: 20,
    color: theme.colors.content.strong,
  },
  scholar: {
    fontSize: 12,
    color: theme.colors.content.muted,
    marginBottom: theme.spacing.scale.xs,
  },
  duration: {
    fontSize: 12,
    color: theme.colors.content.muted,
  },
}));
