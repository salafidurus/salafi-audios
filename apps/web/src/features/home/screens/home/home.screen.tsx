"use client";

import type { FeedContentItemDto, FeedItemDto } from "@sd/core-contracts";

import { useExploreRecentScreen } from "@sd/domain-content";
import { useContinueListening } from "@sd/domain-search";

import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { Search } from "@/shared/components/Search";

import { CategoryChips } from "../../components/category-chips/category-chips";
import { ContinueListeningCard } from "../../components/continue-listening-card/continue-listening-card";
import { CuratedExplorationSection } from "../../components/curated-exploration-section/curated-exploration-section";
import { HeroSection } from "../../components/hero-section/hero-section";
import { MobileDownloadSection } from "../../components/mobile-download-section/mobile-download-section";
import { RecentlyAddedSectionContent } from "../../components/recently-added-section/recently-added-section";
import { ScholarMedallions } from "../../components/scholar-medallions/scholar-medallions";
import { useHomePromotions } from "../../hooks/use-home-promotions";
import { MOBILE_APP_AVAILABILITY } from "./home.constants";
import styles from "./home.screen.module.css";

export type HomeScreenProps = {
  onOpenSearch?: () => void;
  onContinueListening?: (lectureId: string) => void;
};

const MAX_RECENT_ITEMS = 10;

function isContentItem(item: FeedItemDto): item is FeedContentItemDto {
  return item.kind !== "scholar_row" && item.kind !== "topic_row";
}

export function HomeScreen({ onOpenSearch, onContinueListening }: HomeScreenProps) {
  const { recentProgress, isLoading: isProgressLoading } = useContinueListening();
  const { data: promoData, isLoading: isPromosLoading } = useHomePromotions();
  const { data: exploreData, isLoading: isExploreLoading } = useExploreRecentScreen({
    limit: MAX_RECENT_ITEMS,
  });
  const { t } = useTranslation();

  const items: FeedContentItemDto[] = [];
  for (const page of exploreData?.pages ?? []) {
    for (const item of page.items) {
      if (isContentItem(item)) {
        items.push(item);
      }
    }
  }

  const featuredContent = promoData?.hero ?? items[0] ?? null;
  const recentItems = featuredContent
    ? items.filter((item) => item.id !== featuredContent.id)
    : items;
  const curatedItems = promoData?.editorsPicks?.map((pick) => pick.listing) ?? [];
  const hasHistory = Boolean(recentProgress);
  const isHeroLoading = isProgressLoading || isExploreLoading || isPromosLoading;

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
          <div className={styles.searchPanel}>
            <Search.Button
              label={t("home.searchLabel", "What do you want to listen to?")}
              onClick={onOpenSearch}
              inputWrapperClassName={styles.searchInputWrapper}
              placeholderClassName={styles.searchPlaceholder}
            />
          </div>
        </header>

        {recentProgress && (
          <section
            className={styles.continuitySection}
            data-testid="home-continue-listening-section"
          >
            <ContinueListeningCard
              recentProgress={recentProgress}
              onContinueListening={onContinueListening}
            />
          </section>
        )}

        <section className={styles.featuredSection} data-testid="home-featured-section">
          <div data-testid="home-hero-section">
            <HeroSection
              recentProgress={null}
              featuredContent={featuredContent}
              isLoading={isHeroLoading}
              onResume={onContinueListening}
              hasHistory={false}
            />
          </div>
        </section>

        <section className={styles.discoverySection} data-testid="home-discovery-section">
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>{t("home.discovery.eyebrow", "EXPLORE THE LIBRARY")}</p>
            <h2>{t("home.discovery.title", "Find your next direction")}</h2>
            <p>
              {t(
                "home.discovery.description",
                "Browse by topic or scholar when you are ready to explore.",
              )}
            </p>
          </div>
          <div className={styles.discoveryGrid}>
            <div data-testid="home-category-section">
              <CategoryChips />
            </div>
            <div data-testid="home-scholars-section">
              <ScholarMedallions />
            </div>
          </div>
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
