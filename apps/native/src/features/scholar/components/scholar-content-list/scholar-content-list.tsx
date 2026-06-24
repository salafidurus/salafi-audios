import type { ScholarContentItemDto } from "@sd/core-contracts";
import { FlatList, Pressable, TextInput, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { useState } from "react";
import { pickContentField } from "@sd/core-i18n";
import { AppText } from "@/shared/components/AppText/AppText";
import { useShowOriginalContent } from "@/features/i18n/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";

export type ScholarContentListProps = {
  items: ScholarContentItemDto[];
};

function contentRoute(item: ScholarContentItemDto): Href {
  if (item.type === "series") return `/(content)/series/${item.id}` as Href;
  if (item.type === "collection") return `/(content)/collections/${item.id}` as Href;
  return `/(content)/lectures/${item.id}` as Href;
}

export function ScholarContentList({ items }: ScholarContentListProps) {
  const router = useRouter();
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
  const [filter, setFilter] = useState("");

  const featured = items[0];
  if (!featured) {
    return (
      <AppText variant="bodyMd" style={{ opacity: 0.7 }}>
        {t("scholarContent.empty", "No published content yet.")}
      </AppText>
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
      <Pressable
        style={styles.featured}
        onPress={() => router.push(contentRoute(featured) as Href)}
      >
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
          renderItem={({ item }) => {
            const title = pickContentField(item.title, item.original?.title, showOriginal);
            return (
              <Pressable
                style={styles.card}
                onPress={() => router.push(contentRoute(item) as Href)}
              >
                <AppText variant="caption" style={styles.typeLabel}>
                  {item.type}
                </AppText>
                <AppText variant="labelMd" numberOfLines={2}>
                  {title}
                </AppText>
              </Pressable>
            );
          }}
        />
      )}

      {/* Browse */}
      {browse.length > 0 && (
        <View style={styles.browse}>
          <TextInput
            style={styles.filter}
            placeholder={t("scholarContent.filterPlaceholder", "Filter content…")}
            value={filter}
            onChangeText={setFilter}
          />
          <FlatList
            scrollEnabled={false}
            data={filteredBrowse}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const title = pickContentField(item.title, item.original?.title, showOriginal);
              return (
                <Pressable
                  style={styles.row}
                  onPress={() => router.push(contentRoute(item) as Href)}
                >
                  <AppText variant="caption" style={styles.typeLabel}>
                    {item.type}
                  </AppText>
                  <AppText variant="labelMd" style={{ flex: 1 }}>
                    {title}
                  </AppText>
                </Pressable>
              );
            }}
          />
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.scale.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
    gap: theme.spacing.scale.sm,
  },
}));
