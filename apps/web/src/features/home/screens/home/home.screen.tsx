"use client";

import type { FeedContentItemDto, FeedItemDto } from "@sd/core-contracts";

import { useProgressStore } from "@sd/domain-audio";
import { useExploreRecentScreen } from "@sd/domain-content";
import { useContinueListening } from "@sd/domain-search";

import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

import { ContinueListeningCard } from "../../components/continue-listening-card/continue-listening-card";
import { CuratedExplorationSection } from "../../components/curated-exploration-section/curated-exploration-section";
import { MobileDownloadSection } from "../../components/mobile-download-section/mobile-download-section";
import { RecentlyAddedSectionContent } from "../../components/recently-added-section/recently-added-section";
import { ScholarMedallions } from "../../components/scholar-medallions/scholar-medallions";
import { TopicDiscoverySection } from "../../components/topic-discovery-section/topic-discovery-section";
import { useHomePromotions } from "../../hooks/use-home-promotions";
import { FEATURED_SENIOR_SCHOLAR_SLUG, MOBILE_APP_AVAILABILITY } from "./home.constants";
import styles from "./home.screen.module.css";

export type HomeScreenProps = {
  onContinueListening?: (listingSlug: string) => void;
};

const MAX_RECENT_ITEMS = 10;

function isContentItem(item: FeedItemDto): item is FeedContentItemDto {
  return item.kind !== "scholar_row" && item.kind !== "topic_row";
}

function getContentItems(exploreData: { pages?: { items: FeedItemDto[] }[] } | undefined) {
  const items: FeedContentItemDto[] = [];
  for (const page of exploreData?.pages ?? []) {
    for (const item of page.items) {
      if (isContentItem(item)) items.push(item);
    }
  }
  return items;
}

function getLiveRecentProgress(
  recentProgress: ReturnType<typeof useContinueListening>["recentProgress"],
  localProgress:
    | { completedAt?: string | null; positionSeconds?: number; durationSeconds?: number }
    | undefined,
) {
  if (!recentProgress || localProgress?.completedAt) return null;
  return {
    ...recentProgress,
    ...mergeLocalProgress(recentProgress, localProgress),
  };
}

function mergeLocalProgress(
  recentProgress: NonNullable<ReturnType<typeof useContinueListening>["recentProgress"]>,
  localProgress: Parameters<typeof getLiveRecentProgress>[1],
) {
  return {
    positionSeconds: localProgress?.positionSeconds ?? recentProgress.positionSeconds,
    durationSeconds: localProgress?.durationSeconds ?? recentProgress.durationSeconds,
  };
}

function getHomeContentData(
  promoData:
    | {
        hero?: { listing: FeedContentItemDto } | null;
        editorsPicks?: { listing: FeedContentItemDto }[];
      }
    | undefined,
  exploreData: { pages?: { items: FeedItemDto[] }[] } | undefined,
  recentProgress: Parameters<typeof getLiveRecentProgress>[0],
  localProgress: Parameters<typeof getLiveRecentProgress>[1],
) {
  const items = getContentItems(exploreData);
  const featuredContent = getFeaturedContent(promoData, items);
  return {
    featuredContent,
    recentItems: getRecentItems(items, featuredContent),
    curatedItems: getCuratedItems(promoData),
    liveRecentProgress: getLiveRecentProgress(recentProgress, localProgress),
  };
}

function getFeaturedContent(
  promoData: Parameters<typeof getHomeContentData>[0],
  items: FeedContentItemDto[],
): FeedContentItemDto | null {
  return promoData?.hero?.listing ?? items[0] ?? null;
}

function getRecentItems(items: FeedContentItemDto[], featuredContent: FeedContentItemDto | null) {
  return featuredContent ? items.filter((item) => item.id !== featuredContent.id) : items;
}

function getCuratedItems(promoData: Parameters<typeof getHomeContentData>[0]) {
  return promoData?.editorsPicks?.map((pick) => pick.listing) ?? [];
}

type HomeContentProps = {
  featuredContent: FeedContentItemDto | null;
  recentItems: FeedContentItemDto[];
  curatedItems: FeedContentItemDto[];
  liveRecentProgress: ReturnType<typeof getLiveRecentProgress>;
  isHeroLoading: boolean;
  isExploreLoading: boolean;
  isPromosLoading: boolean;
  onContinueListening?: (listingSlug: string) => void;
};

function HomeContent({
  featuredContent,
  recentItems,
  curatedItems,
  liveRecentProgress,
  isHeroLoading,
  isExploreLoading,
  isPromosLoading,
  onContinueListening,
}: HomeContentProps) {
  const { t } = useTranslation();
  const hasHistory = Boolean(liveRecentProgress);

  return (
    <ScreenView
      backgroundVariant="canvas"
      contentStyle={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: "0",
        padding: "2rem 0",
      }}
      data-testid="home-screen-container"
    >
      <div className={styles.homeLayout}>
        <header className={styles.homeHeader} data-testid="home-study-header">
          <div className={styles.welcomeCopy}>
            <p className={styles.eyebrow}>{t("home.eyebrow", "YOUR STUDY SPACE")}</p>
            <h1>
              {hasHistory
                ? t("home.welcomeBack", "Welcome back to your study")
                : t("home.beginStudy", "Build a steady listening path")}
            </h1>
            <p>
              {t("home.intro", "Return to a lesson or find a thoughtful place to begin today.")}
            </p>
          </div>
        </header>

        {liveRecentProgress && (
          <section
            className={styles.continuitySection}
            data-testid="home-continue-listening-section"
          >
            <ContinueListeningCard
              recentProgress={liveRecentProgress}
              onContinueListening={onContinueListening}
            />
          </section>
        )}

        <section className={styles.discoverySection} data-testid="home-discovery-section">
          <TopicDiscoverySection
            featuredContent={featuredContent}
            isFeaturedLoading={isHeroLoading}
            onResume={onContinueListening}
          />
        </section>

        <section className={styles.scholarsSection} data-testid="home-scholars-section">
          <ScholarMedallions featuredScholarSlug={FEATURED_SENIOR_SCHOLAR_SLUG} />
        </section>

        <section data-testid="home-recent-section">
          <RecentlyAddedSectionContent items={recentItems} isLoading={isExploreLoading} />
        </section>

        <section data-testid="home-curated-section">
          <CuratedExplorationSection items={curatedItems} isLoading={isPromosLoading} />
        </section>

        <section className={styles.mobileSection} data-testid="home-mobile-section">
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>{t("home.mobile.eyebrow", "TAKE IT WITH YOU")}</p>
            <h2>{t("home.mobile.title", "Keep your study close")}</h2>
          </div>
          <MobileDownloadSection availability={MOBILE_APP_AVAILABILITY} />
        </section>
      </div>
    </ScreenView>
  );
}

export function HomeScreen({ onContinueListening }: HomeScreenProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { recentProgress } = useContinueListening({
    enabled: !isAuthLoading && isAuthenticated,
  });
  const localProgress = useProgressStore((state) =>
    recentProgress ? state.progressMap[recentProgress.listingSlug] : undefined,
  );
  const { data: promoData, isLoading: isPromosLoading } = useHomePromotions();
  const { data: exploreData, isLoading: isExploreLoading } = useExploreRecentScreen({
    limit: MAX_RECENT_ITEMS,
  });
  const { featuredContent, recentItems, curatedItems, liveRecentProgress } = getHomeContentData(
    promoData,
    exploreData,
    recentProgress,
    localProgress,
  );
  const isHeroLoading = isExploreLoading || isPromosLoading;

  return (
    <HomeContent
      featuredContent={featuredContent}
      recentItems={recentItems}
      curatedItems={curatedItems}
      liveRecentProgress={liveRecentProgress}
      isHeroLoading={isHeroLoading}
      isExploreLoading={isExploreLoading}
      isPromosLoading={isPromosLoading}
      onContinueListening={onContinueListening}
    />
  );
}
