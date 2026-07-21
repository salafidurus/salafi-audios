"use client";

import { useTranslation } from "@/core/i18n/use-translation";
import { useIsRtl } from "@/shared/hooks/use-is-rtl";
import styles from "./hero-section.module.css";

export type HeroSectionProps = Record<string, never>;

export function HeroSection(_props: HeroSectionProps) {
  const isArabic = useIsRtl();
  const { t } = useTranslation();

  return (
    <section className={styles.hero} data-testid="home-hero-section">
      <h1 className={styles.title} data-testid="home-hero-title">
        {t("navigation.siteTitle", "Salafi Durus")}
      </h1>
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
    </section>
  );
}
