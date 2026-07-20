"use client";

import { useEffect, useState } from "react";
import { Search } from "@/shared/components/Search";
import styles from "./hero-section.module.css";

export type HeroSectionProps = {
  onOpenSearch?: () => void;
};

export function HeroSection({ onOpenSearch }: HeroSectionProps) {
  const [isArabic, setIsArabic] = useState(false);

  useEffect(() => {
    const htmlLang = document.documentElement.lang;
    setIsArabic(htmlLang?.startsWith("ar") || document.documentElement.dir === "rtl");
  }, []);

  return (
    <section className={styles.hero} data-testid="home-hero-section">
      <h1 className={styles.title} data-testid="home-hero-title">
        Salafi Durus
      </h1>
      <div className={styles.taglineContainer} data-testid="home-hero-tagline">
        <p className={styles.tagline}>
          قُلْ هَلْ يَسْتَوِى ٱلَّذِينَ يَعْلَمُونَ وَٱلَّذِينَ لَا يَعْلَمُونَ ۗ إِنَّمَا يَتَذَكَّرُ أُو۟لُوا۟ ٱلْأَلْبَـٰبِ
        </p>
        {!isArabic && (
          <p className={styles.taglineTranslation}>
            Say: 'Are those who know equal to those who do not know?' It is only men of
            understanding who will remember
          </p>
        )}
      </div>
      <div className={styles.searchWrapper} data-testid="home-search-wrapper">
        <Search.Button
          label="What do you want to listen to?"
          onClick={onOpenSearch}
          inputWrapperClassName={styles.searchInputWrapper}
          placeholderClassName={styles.searchPlaceholder}
        />
      </div>
    </section>
  );
}
