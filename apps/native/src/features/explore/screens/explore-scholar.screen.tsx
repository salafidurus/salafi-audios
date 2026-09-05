import { getEmptyStateText, getErrorStateText } from "@sd/core-i18n";
import { useScholarPageFeeds } from "@sd/domain-content";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { ScholarContentList } from "@/features/listing/components/scholar-content-list/scholar-content-list";
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
  const { t, i18n } = useTranslation();

  const locale = i18n.language === "ar" ? "ar" : "en";
  const { data, isFetching, isError, refetch } = useScholarPageFeeds(locale);

  const hasBatchItems = useMemo(
    () => data?.batches.some((batch) => batch.items.length > 0) ?? false,
    [data],
  );

  return (
    <ScreenView>
      <RootScreenHeader title={t("explore.scholarsTitle", "Scholars")} />
      <View style={styles.intro}>
        <AppText variant="bodySm" colorRole="muted">
          {t("scholarContent.searchDescription", "Browse scholars and find their latest lessons.")}
        </AppText>
      </View>
      {!hasBatchItems ? (
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
        <ScrollView>
          <View style={styles.listCard}>
            {data?.batches.map((batch) => {
              if (batch.form === "scholars") {
                return batch.items.map((scholar) => (
                  <ScholarRow key={scholar.id} scholar={scholar} onPress={onNavigateToScholar} />
                ));
              }
              if (batch.form === "scholar_listings") {
                return (
                  <View key={batch.id} style={styles.listingBatch}>
                    <AppText variant="titleMd">{batch.title.label}</AppText>
                    <ScholarRow scholar={batch.scholar} onPress={onNavigateToScholar} />
                    <ScholarContentList items={batch.items} />
                  </View>
                );
              }
              if (batch.form !== "topic_scholars") return null;

              return (
                <View key={batch.id} style={styles.listingBatch}>
                  <AppText variant="titleMd">{batch.title.label}</AppText>
                  <AppText variant="bodySm" colorRole="muted">
                    {batch.topic.name}
                  </AppText>
                  {batch.items.map((scholar) => (
                    <ScholarRow key={scholar.id} scholar={scholar} onPress={onNavigateToScholar} />
                  ))}
                </View>
              );
            })}
            {isFetching ? <ExploreLoadingFooter /> : null}
          </View>
        </ScrollView>
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
  listingBatch: {
    gap: theme.spacing.scale.sm,
    marginTop: theme.spacing.scale.lg,
  },
}));
