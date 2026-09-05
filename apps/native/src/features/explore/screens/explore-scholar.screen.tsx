import type { ScholarListItemDto } from "@sd/core-contracts";
import type { ListRenderItemInfo } from "react-native";

import { getEmptyStateText, getErrorStateText } from "@sd/core-i18n";
import { useScholarPageFeeds } from "@sd/domain-content";
import { useCallback, useMemo } from "react";
import { FlatList, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { ScholarRow } from "@/features/listing/components/scholar-row/scholar-row";
import { RootScreenHeader } from "@/features/navigation";
import { AppText, ScreenView } from "@/shared/ui";

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

/** Renders the native explore scholar screen surface and coordinates its user-facing state. */
export function ExploreScholarScreen({ onNavigateToScholar }: ExploreScholarScreenProps) {
  const { t } = useTranslation();

  const { data, isFetching, isError, refetch } = useScholarPageFeeds();

  const allScholars = useMemo(() => data?.batches.flatMap((batch) => batch.items) ?? [], [data]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ScholarListItemDto>) => (
      <ScholarRow scholar={item} onPress={onNavigateToScholar} />
    ),
    [onNavigateToScholar],
  );

  return (
    <ScreenView>
      <RootScreenHeader title={t("explore.scholarsTitle", "Scholars")} />
      <View style={styles.intro}>
        <AppText variant="bodySm" colorRole="muted">
          {t("scholarContent.searchDescription", "Browse scholars and find their latest lessons.")}
        </AppText>
      </View>
      {allScholars.length === 0 ? (
        <View style={styles.status}>
          <ExploreScholarStatus
            isError={isError}
            isFetching={isFetching}
            hasItems={false}
            emptyMessage={getEmptyStateText("feed", t)}
            t={t}
            refetch={refetch}
          />
        </View>
      ) : (
        <>
          <View style={styles.listCard}>
            <FlatList
              data={allScholars}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              ListFooterComponent={isFetching ? <ExploreLoadingFooter /> : null}
            />
          </View>
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
    paddingBottom: theme.spacing.scale.sm,
  },
  listCard: {
    flex: 1,
    marginVertical: theme.spacing.scale.md,
  },
}));
