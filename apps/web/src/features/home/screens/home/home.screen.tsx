"use client";

import type { FeedContentItemDto, FeedItemDto } from "@sd/core-contracts";

import { useExploreRecentScreen } from "@sd/domain-content";
import { useContinueListening } from "@sd/domain-search";
import { User } from "lucide-react";

import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { Search } from "@/shared/components/Search";

import { CategoryChips } from "../../components/category-chips/category-chips";
import { ContinueListeningCard } from "../../components/continue-listening-card/continue-listening-card";
import { HeroSection } from "../../components/hero-section/hero-section";
import { MobileDownloadSection } from "../../components/mobile-download-section/mobile-download-section";
import { RecentlyAddedSection } from "../../components/recently-added-section/recently-added-section";
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
  const hasHistory = Boolean(recentProgress);
  const isHeroLoading = !hasHistory && (isProgressLoading || isExploreLoading || isPromosLoading);

  return (
    <ScreenView
      backgroundVariant="canvas"
      contentStyle={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: "2.5rem",
        padding: "2rem 0",
      }}
      data-testid="home-screen-container"
    >
      <div className={styles.topBar} data-testid="home-top-bar">
        <Search.Button
          label={t("home.searchLabel", "What do you want to listen to?")}
          onClick={onOpenSearch}
          inputWrapperClassName={styles.searchInputWrapper}
          placeholderClassName={styles.searchPlaceholder}
        />
        <button
          type="button"
          className={styles.userButton}
          aria-label={t("account.profile.title", "Account")}
        >
          <User size={16} />
        </button>
      </div>

      {recentProgress && (
        <div data-testid="home-continue-listening-section">
          <ContinueListeningCard
            recentProgress={recentProgress}
            onContinueListening={onContinueListening}
          />
        </div>
      )}
      <div data-testid="home-hero-section">
        <HeroSection
          recentProgress={recentProgress}
          featuredContent={featuredContent}
          isLoading={isHeroLoading}
          onResume={onContinueListening}
          hasHistory={hasHistory}
        />
      </div>
      <div data-testid="home-category-section">
        <CategoryChips />
      </div>
      <div data-testid="home-scholars-section">
        <ScholarMedallions />
      </div>
      <div data-testid="home-recent-section">
        <RecentlyAddedSection />
      </div>
      <div data-testid="home-mobile-section">
        <MobileDownloadSection availability={MOBILE_APP_AVAILABILITY} />
      </div>
    </ScreenView>
  );
}
