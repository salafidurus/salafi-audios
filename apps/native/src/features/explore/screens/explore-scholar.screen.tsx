import type { ScholarListItemDto } from "@sd/core-contracts";
import type { ListRenderItemInfo } from "react-native";

import { getEmptyStateText, getErrorStateText } from "@sd/core-i18n";
import { useInfiniteScholarsList } from "@sd/domain-content";
import { useCallback, useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { ScholarRow } from "@/features/listing/components/scholar-row/scholar-row";
import { RootScreenHeader } from "@/features/navigation";
import { AppText, NativeButton, NativeFormField, ScreenView } from "@/shared/ui";

import { ExploreSkeleton } from "../components/explore-skeleton/explore-skeleton";
import {
  ExploreLoadingFooter,
  ExploreStatusView,
} from "../components/explore-status/explore-status";

/** Composes native explore and catalog surfaces for browsing available content. */
/** Describes the inputs, callbacks, and optional state accepted by Explore Scholar Screen. */
export type ExploreScholarScreenProps = {
  onNavigateToScholar?: (slug: string) => void;
};

function ExploreScholarStatus({
  isError,
  isFetching,
  hasItems,
  emptyMessage,
  t,
  refetch,
}: {
  /** Indicates that the associated request or operation failed and should render its error state. */
  isError: boolean;
  isFetching: boolean;
  hasItems: boolean;
  emptyMessage: string;
  t: ReturnType<typeof useTranslation>["t"];
  refetch: () => void;
}) {
  if (isError && !hasItems) {
    return (
      <ExploreStatusView
        message={getErrorStateText("feed", t)}
        onRetry={refetch}
        retryLabel={t("feed.retry", "Try Again")}
      />
    );
  }
  if (isFetching && !hasItems) {
    return <ExploreSkeleton />;
  }
  if (!hasItems) {
    return <ExploreStatusView message={emptyMessage} />;
  }
  return null;
}

function filterScholars(scholars: ScholarListItemDto[], searchQuery: string) {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return scholars;
  return scholars.filter(
    (scholar) =>
      scholar.name.toLowerCase().includes(query) || scholar.slug.toLowerCase().includes(query),
  );
}

/** Renders the native explore scholar screen surface and coordinates its user-facing state. */
export function ExploreScholarScreen({ onNavigateToScholar }: ExploreScholarScreenProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isFetching, isError, hasNextPage, fetchNextPage, refetch } =
    useInfiniteScholarsList();

  const allScholars = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data?.pages]);

  const filteredScholars = useMemo(
    () => filterScholars(allScholars, searchQuery),
    [allScholars, searchQuery],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ScholarListItemDto>) => (
      <ScholarRow scholar={item} onPress={onNavigateToScholar} />
    ),
    [onNavigateToScholar],
  );

  return (
    <ScreenView>
      <RootScreenHeader title={t("explore.scholarsTitle", "Scholars")} />
      <NativeFormField
        label={t("scholarContent.searchScholars", "Search scholars...")}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t("scholarContent.searchScholars", "Search scholars...")}
        testID="native-scholar-search-input"
      />
      <View style={styles.intro}>
        <AppText variant="bodySm" colorRole="muted">
          {t("scholarContent.searchDescription", "Browse scholars and find their latest lessons.")}
        </AppText>
      </View>
      {filteredScholars.length === 0 ? (
        <View style={styles.status}>
          <ExploreScholarStatus
            isError={isError}
            isFetching={isFetching}
            hasItems={false}
            emptyMessage={
              searchQuery
                ? t("scholarContent.searchNoMatch", "No scholars match your search.")
                : getEmptyStateText("feed", t)
            }
            t={t}
            refetch={refetch}
          />
        </View>
      ) : (
        <>
          <View style={styles.listCard}>
            <FlatList
              data={filteredScholars}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              onEndReached={() => hasNextPage && fetchNextPage()}
              onEndReachedThreshold={0.5}
              ListFooterComponent={isFetching ? <ExploreLoadingFooter /> : null}
            />
          </View>
          {hasNextPage ? (
            <NativeButton
              label={t("common.loadMore", "Load more")}
              loading={isFetching}
              onPress={() => void fetchNextPage()}
            />
          ) : null}
        </>
      )}
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  status: {
    flex: 1,
    justifyContent: "center",
  },
  intro: {
    paddingHorizontal: theme.spacing.scale.md,
    paddingBottom: theme.spacing.scale.sm,
  },
  listCard: {
    flex: 1,
    margin: theme.spacing.scale.md,
  },
}));
