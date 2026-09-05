import type { ExploreTopicItemDto } from "@sd/core-contracts";
import type { ListRenderItemInfo } from "react-native";

import { useCallback } from "react";
import { FlatList, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/ui";

/**
 * Defines the native presentation boundary for a backend-composed topics batch.
 * The renderer preserves topic order and may steer the current Explore request
 * through the public slug without applying eligibility or ranking rules.
 */
/** Describes the inputs, ordering invariant, and optional steering callback for the topic batch. */
export type ExploreTopicBatchRowProps = {
  /** Backend-localized title for the recommendation batch. */
  title: string;
  /** Ordered topic identities supplied by the recommendation response. */
  topics: ExploreTopicItemDto[];
  /** Optional callback for using a topic as the native Explore steering value. */
  onTopicPress?: (slug: string) => void;
};

/** Renders display-ready topics without filtering or reordering recommendation contents. */
export function ExploreTopicBatchRow({ title, topics, onTopicPress }: ExploreTopicBatchRowProps) {
  const renderTopic = useCallback(
    ({ item }: ListRenderItemInfo<ExploreTopicItemDto>) => (
      <Pressable
        accessibilityRole="button"
        onPress={() => onTopicPress?.(item.slug)}
        style={styles.topic}
        testID={`native-topic-card-${item.slug}`}
      >
        <AppText variant="bodyMd">{item.name}</AppText>
      </Pressable>
    ),
    [onTopicPress],
  );

  if (!topics.length) return null;

  return (
    <View style={styles.container}>
      <AppText variant="titleMd" style={styles.heading}>
        {title}
      </AppText>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        data={topics}
        keyExtractor={(item) => item.id}
        renderItem={renderTopic}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingVertical: theme.spacing.scale.md,
  },
  heading: {
    marginBottom: theme.spacing.scale.sm,
    paddingStart: theme.spacing.scale.xs,
  },
  listContent: {
    gap: theme.spacing.scale.md,
    paddingHorizontal: theme.spacing.scale.xs,
  },
  topic: {
    paddingHorizontal: theme.spacing.scale.md,
    paddingVertical: theme.spacing.scale.sm,
    borderRadius: theme.radius.component.panel,
    backgroundColor: theme.colors.surface.subtle,
  },
}));
