"use client";

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
import { MOBILE_APP_AVAILABILITY } from "./home.constants";
import styles from "./home.screen.module.css";

export type HomeScreenProps = {
  onOpenSearch?: () => void;
  onContinueListening?: (lectureId: string) => void;
};

export function HomeScreen({ onOpenSearch, onContinueListening }: HomeScreenProps) {
  const { recentProgress } = useContinueListening();
  const { t } = useTranslation();
  const hasHistory = Boolean(recentProgress);

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

      <HeroSection
        recentProgress={recentProgress}
        onResume={onContinueListening}
        hasHistory={hasHistory}
      />
      <CategoryChips />
      <ScholarMedallions />
      <RecentlyAddedSection />
      {recentProgress && (
        <ContinueListeningCard
          recentProgress={recentProgress}
          onContinueListening={onContinueListening}
        />
      )}
      <MobileDownloadSection availability={MOBILE_APP_AVAILABILITY} />
    </ScreenView>
  );
}
