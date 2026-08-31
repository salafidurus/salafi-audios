import type { ScholarContentItemDto } from "@sd/core-contracts";

import { Host } from "@expo/ui";
import { pickContentField } from "@sd/core-i18n";
import { useState, useCallback } from "react";
import { FlatList, Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";
import { AppText, List, TextInput } from "@/shared/ui";

/** Describes the inputs and callbacks accepted by Scholar Content List. */
/** Describes the inputs, callbacks, and optional state accepted by Scholar Content List. */
export type ScholarContentListProps = {
  items: ScholarContentItemDto[];
};

/** Renders the native scholar content list surface and coordinates its user-facing state. */
export function ScholarContentList({ items }: ScholarContentListProps) {
  const { theme } = useUnistyles();
  const { navigateToListing } = useListingNavigation();
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
  const [filter, setFilter] = useState("");

  const renderRecommendedItem = useCallback(
    ({ item }: { item: ScholarContentItemDto }) => {
      const title = pickContentField(item.title, item.original?.title, showOriginal);
      return (
        <Pressable style={styles.card} onPress={() => navigateToListing(item.slug)}>
          <AppText variant="caption" style={styles.typeLabel}>
            {item.type}
          </AppText>
          <AppText variant="labelMd" numberOfLines={2}>
            {title}
          </AppText>
        </Pressable>
      );
    },
    [showOriginal, navigateToListing],
  );

  const featured = items[0];
  if (!featured) {
    return (
      <EmptyState
        message={t("scholarContent.empty", "No published content yet.")}
        variant="empty"
      />
    );
  }

  const rest = items.slice(1);
  const recommended = rest.slice(0, 4);
  const browse = rest.slice(4);

  const filteredBrowse = filter
    ? browse.filter((i) =>
        pickContentField(i.title, i.original?.title, showOriginal)
          .toLowerCase()
          .includes(filter.toLowerCase()),
      )
    : browse;

  const featuredTitle = pickContentField(featured.title, featured.original?.title, showOriginal);

  return (
    <View style={styles.root}>
      {/* Featured */}
      <Pressable style={styles.featured} onPress={() => navigateToListing(featured.slug)}>
        <AppText variant="caption" style={styles.typeLabel}>
          {featured.type}
        </AppText>
        <AppText variant="titleMd">{featuredTitle}</AppText>
        {featured.lectureCount != null && (
          <AppText variant="caption" style={styles.meta}>
            {t("scholarContent.lectureCount", "{{count}} lectures", {
              count: featured.lectureCount,
            })}
          </AppText>
        )}
      </Pressable>

      {/* Recommended */}
      {recommended.length > 0 && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={recommended}
          keyExtractor={(item) => item.id}
          style={styles.recommendedList}
          renderItem={renderRecommendedItem}
        />
      )}

      {/* Browse */}
      {browse.length > 0 && (
        <View style={styles.browse}>
          <TextInput
            style={styles.filter}
            placeholder={t("scholarContent.filterPlaceholder", "Filter content…")}
            placeholderTextColor={theme.colors.content.muted}
            value={filter}
            onChangeText={setFilter}
          />
          <View>
            {filteredBrowse.map((item) => {
              const title = pickContentField(item.title, item.original?.title, showOriginal);
              return (
                <Host key={item.id} matchContents>
                  <List.Item
                    title={title}
                    onPress={() => navigateToListing(item.slug)}
                    testID={`scholar-content-row-${item.slug}`}
                  >
                    {null}
                  </List.Item>
                </Host>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.spacing.scale.md,
  },
  featured: {
    padding: theme.spacing.component.cardPadding,
    borderRadius: theme.radius.component.card,
    backgroundColor: theme.colors.surface.elevated,
    gap: theme.spacing.scale.xs,
  },
  typeLabel: {
    textTransform: "uppercase",
    letterSpacing: 1,
    color: theme.colors.content.muted,
  },
  meta: {
    color: theme.colors.content.muted,
  },
  recommendedList: {
    flexGrow: 0,
  },
  card: {
    width: 140,
    padding: theme.spacing.scale.sm,
    borderRadius: theme.radius.scale.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    marginEnd: theme.spacing.scale.sm,
    gap: theme.spacing.scale.xs,
  },
  browse: {
    gap: theme.spacing.scale.xs,
  },
  filter: {
    padding: theme.spacing.scale.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.scale.sm,
    color: theme.colors.content.default,
    marginBottom: theme.spacing.scale.sm,
  },
}));
