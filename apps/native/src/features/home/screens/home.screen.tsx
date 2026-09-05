import type { FeedContentItemDto, RecentProgressDto, ScholarListItemDto } from "@sd/core-contracts";

import { useProgressStore } from "@sd/domain-audio";
import {
  useExploreRecentScreen,
  formatScholarName,
  useHomePromotions,
  useScholarsList,
} from "@sd/domain-content";
import { useContinueListening } from "@sd/domain-search";
import { useCallback, useMemo } from "react";
import { FlatList, ScrollView, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { RootScreenHeader } from "@/features/navigation";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { UserAvatar } from "@/shared/components/user-avatar/user-avatar";
import { AppText, ScreenView } from "@/shared/ui";

import { resolveHomeAvatarImage } from "../utils/home-artwork";

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
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.scholarName}`}
      onPress={onPress}
      style={({ pressed }) => [styles.contentCard, pressed && styles.pressedCard]}
      testID={`home-content-${item.slug}`}
    >
      <UserAvatar
        image={resolveHomeAvatarImage(item.thumbnailUrl, item.scholarImageUrl)}
        name={item.title}
        size={56}
        testID={`home-content-image-${item.slug}`}
      />
      <View style={styles.cardCopy}>
        <AppText variant="titleMd" numberOfLines={2} style={styles.listingTitle}>
          {item.title}
        </AppText>
        <AppText variant="caption" colorRole="muted" numberOfLines={2}>
          {formatScholarName(item.scholarName, item.scholarTitle, t)}
        </AppText>
      </View>
    </Pressable>
  );
}

function ListingImageCard({
  item,
  onPress,
  testID,
}: {
  item: FeedContentItemDto;
  onPress?: () => void;
  testID: string;
}) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.scholarName}`}
      onPress={onPress}
      style={({ pressed }) => [styles.featuredCard, pressed && styles.pressedFeaturedCard]}
      testID={testID}
    >
      <View style={styles.featuredMedia}>
        <UserAvatar
          image={resolveHomeAvatarImage(item.thumbnailUrl, item.scholarImageUrl)}
          name={item.title}
          fill
          testID={`home-featured-image-${item.slug}`}
        />
      </View>
      <View style={styles.featuredCopy}>
        <AppText variant="titleMd" colorRole="strong" numberOfLines={2} style={styles.listingTitle}>
          {item.title}
        </AppText>
        <AppText variant="bodySm" colorRole="muted" numberOfLines={2}>
          {formatScholarName(item.scholarName, item.scholarTitle, t)}
        </AppText>
      </View>
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
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={scholar.name}
      onPress={handlePress}
      style={({ pressed }) => [styles.scholarCard, pressed && styles.pressedCard]}
      testID={`home-scholar-${scholar.slug}`}
    >
      <View style={styles.scholarImage}>
        <UserAvatar image={scholar.imageUrl} name={scholar.name} fill />
      </View>
      <AppText
        variant="labelMd"
        numberOfLines={3}
        style={[styles.scholarDetails, styles.listingTitle]}
      >
        {formatScholarName(scholar, undefined, t)}
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
      <AppText variant="titleLg" colorRole="strong">
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${progress.lectureTitle}, ${percent}% listened`}
        onPress={onPress}
        style={({ pressed }) => [styles.resumeCard, pressed && styles.pressedResumeCard]}
        testID="home-resume-listening"
      >
        <View style={styles.resumeBody}>
          <UserAvatar
            image={resolveHomeAvatarImage(progress.artworkUrl, progress.scholarImageUrl)}
            name={progress.lectureTitle}
            size={64}
            testID="home-resume-image"
          />
          <View style={styles.resumeCopy}>
            <AppText variant="titleMd" numberOfLines={2} style={styles.listingTitle}>
              {progress.lectureTitle}
            </AppText>
            <AppText variant="caption" colorRole="muted" numberOfLines={1}>
              {formatScholarName(progress.scholarName, progress.scholarTitle, t)}
            </AppText>
            <AppText variant="caption" colorRole="muted" numberOfLines={1}>
              {percent}% listened
            </AppText>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, percent))}%` }]}
          />
        </View>
      </Pressable>
    </Section>
  );
}

function getContentItems(
  data: ReturnType<typeof useExploreRecentScreen>["data"],
): FeedContentItemDto[] {
  const items: FeedContentItemDto[] = [];
  for (const page of data?.pages ?? []) {
    for (const batch of page.batches) {
      if (batch.kind === "listings") items.push(...batch.items);
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
    <Section
      title={t("home.discovery.title", "FEATURED FOR STUDY")}
      testID="home-discovery-section"
    >
      {item ? (
        <ListingImageCard
          item={item}
          onPress={() => onPress?.(item.slug)}
          testID={`home-featured-${item.slug}`}
        />
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
      <RootScreenHeader title={t("navigation.home", "Home")} />
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
  content: { paddingVertical: theme.spacing.scale.xl, gap: theme.spacing.scale["3xl"] },
  header: { gap: theme.spacing.scale.sm, paddingBottom: theme.spacing.scale.sm },
  section: { gap: theme.spacing.scale.md },
  eyebrow: { letterSpacing: 1.2 },
  featuredCard: {
    overflow: "hidden",
    borderRadius: theme.radius.component.panel,
    backgroundColor: theme.recipes.mixedPromotedPanel.backgroundColor,
    borderWidth: theme.border.width.default,
    borderColor: theme.recipes.mixedPromotedPanel.borderColor,
  },
  pressedFeaturedCard: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  featuredMedia: {
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: theme.radius.component.panelSm,
    backgroundColor: theme.colors.surface.subtle,
  },
  featuredCopy: { gap: theme.spacing.scale.xs, padding: theme.spacing.scale.xl },
  contentCard: {
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.md,
    padding: theme.spacing.scale.md,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.component.card,
    backgroundColor: theme.colors.surface.default,
  },
  pressedCard: { backgroundColor: theme.colors.surface.hover },
  cardCopy: { flex: 1, gap: theme.spacing.scale.xs },
  listingTitle: { fontWeight: "600" },
  inlineTextRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.scale.xs },
  inlineTitle: { flexShrink: 1 },
  inlineScholar: { flexShrink: 1 },
  resumeCard: {
    gap: theme.spacing.scale.sm,
    padding: theme.spacing.scale.xl,
    borderRadius: theme.radius.component.panel,
    backgroundColor: theme.recipes.primarySubtleSurface.backgroundColor,
    borderWidth: theme.border.width.default,
    borderColor: theme.recipes.primarySubtleSurface.borderColor,
  },
  pressedResumeCard: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  resumeBody: { flexDirection: "row", alignItems: "center", gap: theme.spacing.scale.md },
  resumeCopy: { flex: 1, gap: theme.spacing.scale.xs },
  progressTrack: {
    height: 6,
    overflow: "hidden",
    borderRadius: theme.radius.scale.full,
    backgroundColor: theme.colors.surface.default,
  },
  progressFill: {
    height: "100%",
    borderRadius: theme.radius.scale.full,
    backgroundColor: theme.colors.action.primary,
  },
  scholarCard: {
    width: 136,
    minHeight: 176,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: theme.spacing.scale.sm,
    paddingBottom: theme.spacing.scale.md,
    overflow: "hidden",
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.component.card,
    backgroundColor: theme.colors.surface.default,
  },
  scholarImage: {
    width: "100%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface.subtle,
  },
  scholarDetails: { paddingHorizontal: theme.spacing.scale.xs, textAlign: "center" },
  horizontalList: { gap: theme.spacing.scale.sm },
}));
