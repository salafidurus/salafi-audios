"use client";

import { useContinueListening } from "@sd/domain-search";
import { Search } from "@/shared/components/Search";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { HeroSection } from "../../components/hero-section/hero-section";
import { ContinueListeningCard } from "../../components/continue-listening-card/continue-listening-card";
import { MobileDownloadSection } from "../../components/mobile-download-section/mobile-download-section";
import { useTranslation } from "@/core/i18n/use-translation";
import { MOBILE_APP_AVAILABILITY } from "./home.constants";
import styles from "./home.screen.module.css";

export type HomeScreenProps = {
  onOpenSearch?: () => void;
  onContinueListening?: (lectureId: string) => void;
};

export function HomeScreen({ onOpenSearch, onContinueListening }: HomeScreenProps) {
  const { recentProgress } = useContinueListening();
  const { t } = useTranslation();

  return (
    <ScreenView
      backgroundVariant="mixedWash"
      contentStyle={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: "2.5rem",
        padding: "2rem 0",
      }}
      data-testid="home-screen-container"
    >
      <HeroSection />
      <div className={styles.searchWrapper} data-testid="home-search-wrapper">
        <Search.Button
          label={t("home.searchLabel", "What do you want to listen to?")}
          onClick={onOpenSearch}
          inputWrapperClassName={styles.searchInputWrapper}
          placeholderClassName={styles.searchPlaceholder}
        />
      </div>
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
