"use client";

import type { RecentProgressDto } from "@sd/core-contracts";

import { Sparkles } from "lucide-react";

import { useTranslation } from "@/core/i18n/use-translation";
import { Button } from "@/shared/components/Button";

import styles from "./hero-section.module.css";

export type HeroSectionProps = {
  recentProgress?: RecentProgressDto | null;
  onResume?: (lectureSlug: string) => void;
  hasHistory?: boolean;
};

export function HeroSection({ recentProgress, onResume, hasHistory = false }: HeroSectionProps) {
  const { t } = useTranslation();

  return (
    <section className={styles.hero} data-testid="home-hero-section">
      <div className={styles.marginalia} aria-hidden="true">
        <span className={styles.arabicText}>دروس</span>
      </div>
      <div className={styles.bookmark} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.eyebrow} data-testid="home-hero-eyebrow">
          {hasHistory
            ? "AS-SALAMU 'ALAYKUM · CONTINUE YOUR DURUS"
            : "AS-SALAMU 'ALAYKUM · NEW HERE? START WITH THE BASICS"}
        </p>
        <h1 className={styles.title} data-testid="home-hero-title">
          {recentProgress?.lectureTitle ?? "Salafi Durus"}
        </h1>
        <p className={styles.subtitle}>
          {hasHistory
            ? `Shaykh Allamah ${recentProgress?.scholarName ?? ""}`
            : "Browse scholars, topics, and lectures below."}
        </p>
        {!hasHistory && (
          <p className={styles.recommendation}>
            <Sparkles size={12} /> Recommended starting point for new students
          </p>
        )}
        <div className={styles.ctaRow}>
          {hasHistory && recentProgress ? (
            <Button
              variant="primary"
              size="lg"
              label={t("home.hero.resume", "Resume")}
              onClick={() => onResume?.(recentProgress.lectureSlug)}
              data-testid="home-hero-resume"
            />
          ) : (
            <Button
              variant="primary"
              size="lg"
              label={t("home.hero.start", "Start listening")}
              onClick={() => {}}
              data-testid="home-hero-start"
            />
          )}
        </div>
      </div>
    </section>
  );
}
