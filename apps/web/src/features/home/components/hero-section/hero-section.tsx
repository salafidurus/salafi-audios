import type { RecentProgressDto } from "@sd/core-contracts";

import { routes } from "@sd/core-contracts";
import { Sparkles, Play, Shield, Scale, MessageSquare } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { usePlayListing } from "@/features/audio";

import styles from "./hero-section.module.css";

export type HeroSectionProps = {
  recentProgress?: RecentProgressDto | null;
  onResume?: (lectureSlug: string) => void;
  hasHistory?: boolean;
};

export function HeroSection({ recentProgress, onResume, hasHistory = false }: HeroSectionProps) {
  const { t } = useTranslation();

  const { play: playHero } = usePlayListing({
    id: recentProgress?.lectureId ?? "nullifiers-of-islam",
    slug: recentProgress?.lectureSlug ?? "nullifiers-of-islam",
    title: recentProgress?.lectureTitle ?? "Nullifiers of Islam",
    format: "single",
    scholarName: recentProgress?.scholarName ?? "Shaykh Allamah Salih ibn Fawzan al-Fawzan",
  });

  const handleStart = () => {
    if (hasHistory && recentProgress) {
      if (onResume) {
        onResume(recentProgress.lectureSlug);
      } else {
        void playHero();
      }
    } else {
      void playHero();
    }
  };

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
          {recentProgress?.lectureTitle ?? "Nullifiers of Islam"}
        </h1>
        <p className={styles.subtitle}>
          {hasHistory && recentProgress
            ? `Shaykh Allamah ${recentProgress.scholarName}`
            : "Shaykh Allamah Salih ibn Fawzan al-Fawzan · Aqeedah"}
        </p>
        {!hasHistory && (
          <p className={styles.recommendation}>
            <Sparkles size={13} color="var(--action-primary)" /> Recommended starting point for new
            students
          </p>
        )}
        <div className={styles.ctaRow}>
          <button
            type="button"
            className={styles.startBtn}
            onClick={handleStart}
            data-testid={hasHistory ? "home-hero-resume" : "home-hero-start"}
          >
            <Play size={14} fill="currentColor" />
            <span>
              {hasHistory
                ? t("home.hero.resume", "Resume")
                : t("home.hero.start", "Start listening")}
            </span>
          </button>

          {!hasHistory && (
            <>
              <span className={styles.browseLabel}>Or browse:</span>
              <Link href={`${routes.search}?topic=aqeedah`} className={styles.categoryPill}>
                <Shield size={13} color="var(--action-primary)" />
                <span>Aqeedah</span>
              </Link>
              <Link href={`${routes.search}?topic=fiqh`} className={styles.categoryPill}>
                <Scale size={13} color="var(--action-primary)" />
                <span>Fiqh</span>
              </Link>
              <Link href={`${routes.search}?topic=hadith`} className={styles.categoryPill}>
                <MessageSquare size={13} color="var(--action-primary)" />
                <span>Hadith</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
