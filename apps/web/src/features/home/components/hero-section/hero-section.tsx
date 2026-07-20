"use client";

import { AppText } from "@/shared/components/AppText/AppText";
import { Search } from "@/shared/components/Search";
import styles from "./hero-section.module.css";

export type HeroSectionProps = {
  onOpenSearch?: () => void;
};

export function HeroSection({ onOpenSearch }: HeroSectionProps) {
  return (
    <section className={styles.hero} data-testid="home-hero-section">
      <AppText variant="displayLg" style={{ fontStyle: "normal" }}>
        <span data-testid="home-hero-title">Salafi Durus</span>
      </AppText>
      <AppText variant="bodyLg" style={{ color: "var(--content-secondary)", maxWidth: "600px" }}>
        <span data-testid="home-hero-tagline">
          Listen to audio lectures from trusted Salafi scholars
        </span>
      </AppText>
      <div className={styles.searchWrapper} data-testid="home-search-wrapper">
        <Search.Button label="What do you want to listen to?" onClick={onOpenSearch} />
      </div>
    </section>
  );
}
