"use client";

import type { RecentProgressDto } from "@sd/core-contracts";

import { useTranslation } from "@/core/i18n/use-translation";
import { Button } from "@/shared/components/Button";
import { useIsRtl } from "@/shared/hooks/use-is-rtl";

import styles from "./hero-section.module.css";

export type HeroSectionProps = {
  recentProgress?: RecentProgressDto | null;
  onResume?: (lectureSlug: string) => void;
};

export function HeroSection({ recentProgress, onResume }: HeroSectionProps) {
  const isArabic = useIsRtl();
  const { t } = useTranslation();

  return (
    <section className={styles.hero} data-testid="home-hero-section">
      <p className={styles.eyebrow} data-testid="home-hero-eyebrow">
        {t("home.hero.eyebrow", "As-Salamu 'alaykum")}
      </p>
      <h1 className={styles.title} data-testid="home-hero-title">
        {t("navigation.siteTitle", "Salafi Durus")}
      </h1>
      <span className={styles.ribbon} aria-hidden="true" />
      <div className={styles.taglineContainer} data-testid="home-hero-tagline">
        <p className={styles.tagline}>
          قُلْ هَلْ يَسْتَوِى ٱلَّذِينَ يَعْلَمُونَ وَٱلَّذِينَ لَا يَعْلَمُونَ ۗ إِنَّمَا يَتَذَكَّرُ أُو۟لُوا۟ ٱلْأَلْبَـٰبِ
        </p>
        {!isArabic && (
          <p className={styles.taglineTranslation}>
            {t(
              "home.hero.taglineTranslation",
              "Say: 'Are those who know equal to those who do not know?' It is only men of understanding who will remember",
            )}{" "}
            <span className={styles.surahReference}>
              {t("home.hero.surahReference", "Surah Az-Zumar (39:9)")}
            </span>
          </p>
        )}
      </div>
      {recentProgress && (
        <div className={styles.ctaRow}>
          <Button
            variant="primary"
            size="lg"
            label={t("home.hero.resume", "Continue Listening")}
            onClick={() => onResume?.(recentProgress.lectureSlug)}
            data-testid="home-hero-resume"
          />
        </div>
      )}
    </section>
  );
}
