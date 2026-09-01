import type { FeedContentItemDto, RecentProgressDto, ScholarListItemDto } from "@sd/core-contracts";

import { useProgressStore } from "@sd/domain-audio";
import { useExploreRecentScreen, useHomePromotions, useScholarsList } from "@sd/domain-content";
import { useContinueListening } from "@sd/domain-search";
import { useCallback, useMemo } from "react";
import { FlatList, ScrollView, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { AppText, ScreenView } from "@/shared/ui";

/** Provides the native Home study surface and its public/personal content sections. */
/**
 * Describes navigation callbacks supplied by the native Home route.
 * Keeping routing outside the feature makes the study surface reusable and testable.
 */
export type HomeScreenProps = {
  onNavigateToListing?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

function ContentCard({ item, onPress }: { item: FeedContentItemDto; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.contentCard} testID={`home-content-${item.slug}`}>
      <AppText variant="titleMd" numberOfLines={2}>
        {item.title}
      </AppText>
      <AppText variant="caption" colorRole="muted">
        {item.scholarName}
      </AppText>
    </Pressable>
  );
}

function ScholarCard({
  scholar,
  onSelect,
}: {
  scholar: ScholarListItemDto;
  onSelect?: (slug: string) => void;
}) {
  const handlePress = useCallback(() => onSelect?.(scholar.slug), [onSelect, scholar.slug]);

  return (
    <Pressable
      onPress={handlePress}
      style={styles.scholarCard}
      testID={`home-scholar-${scholar.slug}`}
    >
      <AppText variant="labelMd" numberOfLines={2}>
        {scholar.name}
      </AppText>
    </Pressable>
  );
}

function Section({
  title,
  children,
  testID,
}: {
  title: string;
  children: React.ReactNode;
  testID: string;
}) {
  return (
    <View style={styles.section} testID={testID}>
      <AppText variant="titleMd" colorRole="strong">
        {title}
      </AppText>
      {children}
    </View>
  );
}

function ContinueListening({
  progress,
  onPress,
}: {
  progress: RecentProgressDto;
  onPress?: () => void;
}) {
  const { t } = useTranslation();
  const localProgress = useProgressStore((state) => state.progressMap[progress.listingSlug]);
  const position = localProgress?.positionSeconds ?? progress.positionSeconds;
  const percent =
    progress.durationSeconds > 0 ? Math.round((position / progress.durationSeconds) * 100) : 0;

  return (
    <Section
      title={t("home.continue.title", "Continue Listening")}
      testID="home-continue-listening"
    >
      <Pressable onPress={onPress} style={styles.resumeCard} testID="home-resume-listening">
        <AppText variant="titleMd" numberOfLines={2}>
          {progress.lectureTitle}
        </AppText>
        <AppText variant="caption" colorRole="muted">
          {progress.scholarName} · {percent}%
        </AppText>
      </Pressable>
    </Section>
  );
}

function getContentItems(
  data: ReturnType<typeof useExploreRecentScreen>["data"],
): FeedContentItemDto[] {
  const items: FeedContentItemDto[] = [];
  for (const page of data?.pages ?? []) {
    for (const item of page.items) {
      if (item.kind !== "scholar_row" && item.kind !== "topic_row") {
        items.push(item);
      }
    }
  }
  return items;
}

function getFeaturedItem(
  data: ReturnType<typeof useHomePromotions>["data"],
  items: FeedContentItemDto[],
) {
  return data?.hero?.listing ?? items[0];
}

function getCuratedItems(data: ReturnType<typeof useHomePromotions>["data"]): FeedContentItemDto[] {
  return data?.editorsPicks.map((pick) => pick.listing) ?? [];
}

function getScholars(data: ReturnType<typeof useScholarsList>["data"]): ScholarListItemDto[] {
  return data?.scholars ?? [];
}

function isHomeLoading(
  promotions: ReturnType<typeof useHomePromotions>,
  explore: ReturnType<typeof useExploreRecentScreen>,
  scholars: ReturnType<typeof useScholarsList>,
) {
  return promotions.isLoading || explore.isLoading || scholars.isLoading;
}

function DiscoverySection({
  item,
  onPress,
}: {
  item?: FeedContentItemDto;
  onPress?: (slug: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <Section title={t("home.discovery.title", "Discovery")} testID="home-discovery-section">
      {item ? (
        <ContentCard item={item} onPress={() => onPress?.(item.slug)} />
      ) : (
        <EmptyState message={t("home.discovery.empty", "No lessons are available yet.")} />
      )}
    </Section>
  );
}

function ScholarSection({
  scholars,
  onPress,
}: {
  scholars: ScholarListItemDto[];
  onPress?: (slug: string) => void;
}) {
  const { t } = useTranslation();
  const visibleScholars = useMemo(() => scholars.slice(0, 8), [scholars]);
  const renderScholar = useCallback(
    ({ item }: { item: ScholarListItemDto }) => <ScholarCard scholar={item} onSelect={onPress} />,
    [onPress],
  );

  return (
    <Section title={t("home.scholars.title", "Scholars")} testID="home-scholars-section">
      <FlatList
        data={visibleScholars}
        horizontal
        keyExtractor={(scholar) => scholar.id}
        renderItem={renderScholar}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </Section>
  );
}

function ContentSection({
  title,
  testID,
  items,
  emptyMessage,
  onPress,
}: {
  title: string;
  testID: string;
  items: FeedContentItemDto[];
  emptyMessage: string;
  onPress?: (slug: string) => void;
}) {
  return (
    <Section title={title} testID={testID}>
      {items.length > 0 ? (
        items.map((item) => (
          <ContentCard key={item.id} item={item} onPress={() => onPress?.(item.slug)} />
        ))
      ) : (
        <EmptyState message={emptyMessage} />
      )}
    </Section>
  );
}

function HomeSurface({
  progress,
  featured,
  items,
  curated,
  scholars,
  onNavigateToListing,
  onNavigateToScholar,
}: {
  progress: RecentProgressDto | null;
  featured?: FeedContentItemDto;
  items: FeedContentItemDto[];
  curated: FeedContentItemDto[];
  scholars: ScholarListItemDto[];
  onNavigateToListing?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <ScreenView>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header} testID="home-study-header">
          <AppText variant="caption" colorRole="primary">
            {t("home.eyebrow", "YOUR STUDY SPACE")}
          </AppText>
          <AppText variant="displayMd" colorRole="strong">
            {t("home.title", "Build a steady listening path")}
          </AppText>
          <AppText colorRole="muted">
            {t("home.intro", "Return to a lesson or find a thoughtful place to begin today.")}
          </AppText>
        </View>
        {progress ? (
          <ContinueListening
            progress={progress}
            onPress={() => onNavigateToListing?.(progress.lectureSlug)}
          />
        ) : null}
        <DiscoverySection item={featured} onPress={onNavigateToListing} />
        <ScholarSection scholars={scholars} onPress={onNavigateToScholar} />
        <ContentSection
          title={t("home.recent.title", "Recently Added")}
          testID="home-recent-section"
          items={items.slice(0, 6)}
          emptyMessage={t(
            "home.recent.empty",
            "New lessons will appear here as they are published.",
          )}
          onPress={onNavigateToListing}
        />
        <ContentSection
          title={t("home.curated.title", "Curated for Study")}
          testID="home-curated-section"
          items={curated}
          emptyMessage={t("home.curated.empty", "Curated lessons will appear here soon.")}
          onPress={onNavigateToListing}
        />
        <Section
          title={t("home.mobile.title", "Keep your study close")}
          testID="home-mobile-section"
        >
          <AppText colorRole="muted">
            {t(
              "home.mobile.description",
              "Downloaded audio and local progress remain available for mobile continuity.",
            )}
          </AppText>
        </Section>
      </ScrollView>
    </ScreenView>
  );
}

function useHomeQueries() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const progressQuery = useContinueListening({ enabled: !isAuthLoading && isAuthenticated });
  const promotionsQuery = useHomePromotions();
  const exploreQuery = useExploreRecentScreen({ limit: 10 });
  const scholarsQuery = useScholarsList();
  const items = getContentItems(exploreQuery.data);
  const featured = getFeaturedItem(promotionsQuery.data, items);
  const curated = getCuratedItems(promotionsQuery.data);

  return {
    progress: progressQuery.recentProgress,
    promotionsQuery,
    featured,
    items,
    curated,
    scholars: getScholars(scholarsQuery.data),
    isLoading: isHomeLoading(promotionsQuery, exploreQuery, scholarsQuery),
  };
}

function HomeScreenState({
  model,
  onNavigateToListing,
  onNavigateToScholar,
}: {
  model: ReturnType<typeof useHomeQueries>;
  onNavigateToListing?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
}) {
  const { t } = useTranslation();
  if (model.isLoading && !model.featured)
    return (
      <ScreenView center>
        <EmptyState message={t("home.loading", "Loading your study space…")} variant="loading" />
      </ScreenView>
    );
  if (model.promotionsQuery.isError && !model.featured && model.items.length === 0)
    return (
      <ScreenView center>
        <EmptyState
          message={t("home.error", "Home could not be loaded.")}
          variant="error"
          onRetry={() => void model.promotionsQuery.refetch()}
          retryLabel={t("serverError.retry", "Try Again")}
        />
      </ScreenView>
    );
  return (
    <HomeSurface
      progress={model.progress}
      featured={model.featured}
      items={model.items}
      curated={model.curated}
      scholars={model.scholars}
      onNavigateToListing={onNavigateToListing}
      onNavigateToScholar={onNavigateToScholar}
    />
  );
}

/**
 * Composes public discovery with the authenticated unfinished-progress projection.
 * Public queries remain available anonymously; Continue Listening is never inferred
 * from catalog data and is rendered only when the authenticated projection exists.
 */
export function HomeScreen({ onNavigateToListing, onNavigateToScholar }: HomeScreenProps) {
  return (
    <HomeScreenState
      model={useHomeQueries()}
      onNavigateToListing={onNavigateToListing}
      onNavigateToScholar={onNavigateToScholar}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  content: { paddingVertical: theme.spacing.layout.pageY, gap: theme.spacing.scale.lg },
  header: { gap: theme.spacing.scale.sm },
  section: { gap: theme.spacing.scale.sm },
  contentCard: {
    gap: theme.spacing.scale.xs,
    padding: theme.spacing.scale.md,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.component.card,
    backgroundColor: theme.colors.surface.default,
  },
  resumeCard: {
    gap: theme.spacing.scale.xs,
    padding: theme.spacing.scale.md,
    borderRadius: theme.radius.component.card,
    backgroundColor: theme.recipes.primarySubtleSurface.backgroundColor,
  },
  scholarCard: {
    width: 120,
    minHeight: 64,
    justifyContent: "center",
    padding: theme.spacing.scale.sm,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.component.card,
    backgroundColor: theme.colors.surface.default,
  },
  horizontalList: { gap: theme.spacing.scale.sm },
}));
