"use client";

import { Search } from "@/shared/components/Search";
import styles from "./hero-section.module.css";

export type HeroSectionProps = {
  onOpenSearch?: () => void;
};

export function HeroSection({ onOpenSearch }: HeroSectionProps) {
  return (
    <section className={styles.hero} data-testid="home-hero-section">
      <h1 className={styles.title} data-testid="home-hero-title">
        Salafi Durus
      </h1>
      <p className={styles.tagline} data-testid="home-hero-tagline">
        رَبِّهِۦ ۗ قُلْ هَلْ يَسْتَوِى ٱلَّذِينَ يَعْلَمُونَ وَٱلَّذِينَ لَا يَعْلَمُونَ ۗ إِنَّمَا يَتَذَكَّرُ أُو۟لُوا۟ ٱلْأَلْبَـٰبِ
      </p>
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
