import type { FeedContentItemDto, RecentProgressDto } from "@sd/core-contracts";

import { routes } from "@sd/core-contracts";
import { Sparkles, Play, Shield, Scale, MessageSquare } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { usePlayListing } from "@/features/audio";

import styles from "./hero-section.module.css";

export type HeroSectionProps = {
  recentProgress?: RecentProgressDto | null;
  featuredContent?: FeedContentItemDto | null;
  isLoading?: boolean;
  onResume?: (lectureSlug: string) => void;
  hasHistory?: boolean;
};

export function HeroSection({
  recentProgress,
  featuredContent,
  isLoading = false,
  onResume,
  hasHistory = false,
}: HeroSectionProps) {
  const { t } = useTranslation();

  const heroItem = hasHistory && recentProgress
    ? {
        id: recentProgress.lectureId,
        slug: recentProgress.lectureSlug,
        title: recentProgress.lectureTitle,
        scholarName: recentProgress.scholarName,
      }
    : featuredContent
    ? {
        id: featuredContent.id,
        slug: featuredContent.slug,
        title: featuredContent.title,
        scholarName: featuredContent.scholarName,
      }
    : {
        id: "nullifiers-of-islam",
        slug: "nullifiers-of-islam",
        title: "Nullifiers of Islam",
        scholarName: "Salih ibn Fawzan al-Fawzan",
      };

  const { play: playHero } = usePlayListing({
    id: heroItem.id,
    slug: heroItem.slug,
    title: heroItem.title,
    format: "single",
    scholarName: heroItem.scholarName,
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

  if (isLoading) {
    return (
      <section className={styles.hero} data-testid="home-hero-skeleton">
        <div className={styles.marginalia} aria-hidden="true">
          <span className={styles.arabicText}>دروس</span>
        </div>
        <div className={styles.bookmark} aria-hidden="true" />
        <div className={styles.content}>
          <div className={`${styles.skeletonLine} ${styles.skeletonEyebrow}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonSubtitle}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonCta}`} />
        </div>
      </section>
    );
  }

  const title = heroItem?.title ?? "Featured Lecture";
  const scholarName = heroItem?.scholarName ?? "Salafi Scholar";

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
            : "AS-SALAMU 'ALAYKUM · FEATURED LESSON"}
        </p>
        <h1 className={styles.title} data-testid="home-hero-title">
          {title}
        </h1>
        <p className={styles.subtitle}>
          {`Shaykh ${scholarName}`}
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

