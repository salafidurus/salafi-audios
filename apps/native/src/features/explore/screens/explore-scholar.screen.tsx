import { useCallback, useState } from "react";
import { FlatList, View } from "react-native";
import type { ListRenderItemInfo } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { ScholarListItemDto } from "@sd/core-contracts";
import { useInfiniteScholarsList } from "@sd/domain-content";
import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components/AppText/AppText";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { SearchInput } from "@/features/search/components/SearchInput/SearchInput";
import { ScholarRow } from "@/features/listing/components/scholar-row/scholar-row";

export type ExploreScholarScreenProps = {
  onNavigateToScholar?: (slug: string) => void;
};

function renderScholarItem(
  scholar: ScholarListItemDto,
  onNavigateToScholar?: (slug: string) => void,
) {
  return <ScholarRow scholar={scholar} onPress={onNavigateToScholar} />;
}

export function ExploreScholarScreen({ onNavigateToScholar }: ExploreScholarScreenProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isFetching, isError, hasNextPage, fetchNextPage, refetch } =
    useInfiniteScholarsList();

  const allScholars = data?.pages.flatMap((p) => p.items) ?? [];

  const filteredScholars = searchQuery.trim()
    ? allScholars.filter(
        (scholar) =>
          scholar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          scholar.slug.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allScholars;

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ScholarListItemDto>) =>
      renderScholarItem(item, onNavigateToScholar),
    [onNavigateToScholar],
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        <AppText variant="titleMd" style={styles.title}>
          {t("explore.scholarsTitle", "Scholars")}
        </AppText>
        <SearchInput
          placeholder={t("scholarContent.searchScholars", "Search scholars...")}
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </View>
    ),
    [t, searchQuery, setSearchQuery],
  );

  const renderFooter = useCallback(
    () =>
      isFetching && allScholars.length > 0 ? (
        <View style={styles.loadingFooter}>
          <AppText variant="bodyMd">{t("feed.loading", "Loading...")}</AppText>
        </View>
      ) : null,
    [isFetching, allScholars.length, t],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <AppText variant="bodyMd">
          {searchQuery
            ? t("scholarContent.searchNoMatch", "No scholars match your search.")
            : t("explore.noScholars", "No scholars available.")}
        </AppText>
      </View>
    ),
    [searchQuery, t],
  );

  if (isError && allScholars.length === 0) {
    return (
      <ScreenView center>
        <AppText variant="bodyMd">{t("feed.error", "Failed to load scholars.")}</AppText>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <FlatList
        data={filteredScholars}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={filteredScholars.length === 0 ? renderEmpty : null}
        ListFooterComponent={renderFooter}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        scrollIndicatorInsets={{ right: 1 }}
      />
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  headerContainer: {
    paddingHorizontal: theme.spacing.scale.md,
    paddingVertical: theme.spacing.scale.lg,
    gap: theme.spacing.scale.md,
  },
  title: {
    color: theme.colors.content.default,
  },
  loadingFooter: {
    paddingVertical: theme.spacing.scale.lg,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.scale.xl,
  },
}));
