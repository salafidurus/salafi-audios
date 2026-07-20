"use client";

import { useContinueListening } from "@sd/domain-search";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { HeroSection } from "../../components/hero-section/hero-section";
import { ContinueListeningCard } from "../../components/continue-listening-card/continue-listening-card";
import { WhySalafiDurusSection } from "../../components/why-salafi-durus-section/why-salafi-durus-section";
import { MobileDownloadSection } from "../../components/mobile-download-section/mobile-download-section";
import { MOBILE_APP_AVAILABILITY } from "./home.constants";
import styles from "./home.screen.module.css";

export type HomeScreenProps = {
  onOpenSearch?: () => void;
  onContinueListening?: (lectureId: string) => void;
};

export function HomeScreen({ onOpenSearch, onContinueListening }: HomeScreenProps) {
  const { recentProgress } = useContinueListening();

  return (
    <ScreenView backgroundVariant="mixedWash">
      <div className={styles.container} data-testid="home-screen-container">
        <HeroSection onOpenSearch={onOpenSearch} />
        {recentProgress && (
          <ContinueListeningCard
            recentProgress={recentProgress}
            onContinueListening={onContinueListening}
          />
        )}
        <WhySalafiDurusSection />
        <MobileDownloadSection availability={MOBILE_APP_AVAILABILITY} />
      </div>
    </ScreenView>
  );
}
