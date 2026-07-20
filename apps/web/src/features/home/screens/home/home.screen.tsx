"use client";

import { useQuickBrowse } from "@sd/domain-search";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { Search } from "@/shared/components/Search";
import { ShieldCheck, WifiOff, Heart } from "lucide-react";
import styles from "./home.screen.module.css";

export type HomeScreenProps = {
  onOpenSearch?: () => void;
  onContinueListening?: (lectureId: string) => void;
};

export function HomeScreen({ onOpenSearch, onContinueListening }: HomeScreenProps) {
  const { data } = useQuickBrowse();
  const recentProgress = data?.recentProgress;

  return (
    <ScreenView backgroundVariant="mixedWash">
      <div className={styles.container} data-testid="home-screen-container">
        {/* 1. Hero Section */}
        <section className={styles.hero} data-testid="home-hero-section">
          <AppText variant="displayLg" style={{ fontStyle: "normal" }}>
            <span data-testid="home-hero-title">Salafi Durus</span>
          </AppText>
          <AppText variant="bodyLg" style={{ color: "var(--content-muted)" }}>
            <span data-testid="home-hero-tagline">
              Listen to audio lectures from trusted Salafi scholars
            </span>
          </AppText>
          <div className={styles.searchWrapper} data-testid="home-search-wrapper">
            <Search.Button label="What do you want to listen to?" onClick={onOpenSearch} />
          </div>
        </section>

        {/* 2. Continue Listening Section (Conditional) */}
        {recentProgress && (
          <section
            className={styles.continueSection}
            aria-label="Resume playback"
            data-testid="continue-listening-section"
          >
            <AppText variant="titleMd">
              <span data-testid="continue-listening-title">Continue Listening</span>
            </AppText>
            <button
              type="button"
              data-testid="continue-listening-card"
              onClick={() => onContinueListening?.(recentProgress.lectureId)}
              className={styles.continueCard}
            >
              <div className={styles.continueHeader}>
                <AppText
                  variant="bodyLg"
                  style={{ fontWeight: "var(--typo-body-lg-font-weight-bold)" }}
                >
                  <span data-testid="continue-listening-lecture-title">
                    {recentProgress.lectureTitle}
                  </span>
                </AppText>
                <AppText variant="caption" style={{ color: "var(--content-secondary)" }}>
                  <span data-testid="continue-listening-scholar-name">
                    {recentProgress.scholarName}
                  </span>
                </AppText>
              </div>
              <div className={styles.progressRow}>
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${recentProgress.durationSeconds > 0 ? (recentProgress.positionSeconds / recentProgress.durationSeconds) * 100 : 0}%`,
                    }}
                  />
                </div>
                <AppText
                  variant="caption"
                  style={{ color: "var(--content-muted)", whiteSpace: "nowrap" }}
                >
                  <span data-testid="continue-listening-progress-text">
                    {formatDuration(recentProgress.positionSeconds)} /{" "}
                    {formatDuration(recentProgress.durationSeconds)}
                  </span>
                </AppText>
              </div>
            </button>
          </section>
        )}

        {/* 3. Platform Features Section */}
        <section
          className={styles.featuresSection}
          aria-label="Platform features"
          data-testid="features-section"
        >
          <AppText variant="titleLg">
            <span data-testid="features-section-title">Why Salafi Durus</span>
          </AppText>
          <div className={styles.featuresGrid} data-testid="features-grid">
            {/* Feature 1: Verified Scholars */}
            <div className={styles.featureCard} data-testid="feature-card-scholars">
              <div className={styles.featureIcon}>
                <ShieldCheck size={20} />
              </div>
              <AppText variant="titleMd">
                <span data-testid="feature-card-title-scholars">Verified Scholars</span>
              </AppText>
              <AppText variant="bodySm" style={{ color: "var(--content-muted)" }}>
                Audio lectures from trusted Salafi scholars, carefully curated for authentic Islamic
                knowledge.
              </AppText>
            </div>

            {/* Feature 2: Offline Sync */}
            <div className={styles.featureCard} data-testid="feature-card-offline">
              <div className={styles.featureIcon}>
                <WifiOff size={20} />
              </div>
              <AppText variant="titleMd">
                <span data-testid="feature-card-title-offline">Offline Sync</span>
              </AppText>
              <AppText variant="bodySm" style={{ color: "var(--content-muted)" }}>
                Download lectures and listen on-the-go with our upcoming mobile apps. No internet
                connection needed.
              </AppText>
            </div>

            {/* Feature 3: Seeking His Pleasure */}
            <div className={styles.featureCard} data-testid="feature-card-pleasure">
              <div className={styles.featureIcon}>
                <Heart size={20} />
              </div>
              <AppText variant="titleMd">
                <span data-testid="feature-card-title-pleasure">Seeking His Pleasure</span>
              </AppText>
              <AppText variant="bodySm" style={{ color: "var(--content-muted)" }}>
                Purely seeking the pleasure of Allah ﷻ. No ads, no social media, no distractions.
              </AppText>
            </div>
          </div>
        </section>

        {/* 4. Mobile Download Section (Split Card Layout) */}
        <section
          className={styles.downloadSection}
          aria-label="Mobile apps download"
          data-testid="mobile-download-section"
        >
          <div className={styles.downloadInfo} data-testid="mobile-download-info">
            <AppText variant="titleLg">
              <span data-testid="mobile-download-title">Coming to Mobile</span>
            </AppText>
            <AppText variant="bodyMd" style={{ color: "var(--content-muted)" }}>
              Native iOS and Android apps are under active development for a distraction-free
              listening experience.
            </AppText>
          </div>
          <div className={styles.downloadActions} data-testid="mobile-download-actions">
            {/* App Store Badge */}
            <div className={styles.badgeWrapper} data-testid="app-store-wrapper">
              <button
                type="button"
                disabled
                className={styles.badgeButton}
                aria-label="Download from App Store - Coming Soon"
                data-testid="download-badge-app-store"
              >
                <svg
                  viewBox="0 0 135 40"
                  width="100%"
                  height="100%"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="0.5"
                    y="0.5"
                    width="134"
                    height="39"
                    rx="5"
                    fill="#000"
                    stroke="#A6A6A6"
                    strokeWidth="1"
                  />
                  <path
                    d="M22.56,22.06c0-3.32,2.71-4.91,2.84-5c-1.55-2.27-3.97-2.58-4.83-2.61c-2.06-.21-4,.21-5.06,.21s-2.73-.37-4.47-.34c-2.28,.03-4.38,1.33-5.55,3.36c-2.37,4.11-.61,10.18,1.7,13.51c1.13,1.63,2.46,3.46,4.22,3.39c1.7-.07,2.34-1.1,4.39-1.1s2.63,1.1,4.39,1.06c1.8-.03,2.98-1.66,4.09-3.28c1.29-1.89,1.82-3.71,1.85-3.8C26.08,29.35,22.56,28,22.56,22.06Z"
                    fill="#FFF"
                  />
                  <path
                    d="M19.16,11.51a4.84,4.84,0,0,0,1.16-3.46,4.87,4.87,0,0,0-3.19,1.64,4.55,4.55,0,0,0-1.22,3.34A4.32,4.32,0,0,0,19.16,11.51Z"
                    fill="#FFF"
                  />
                  <text
                    x="36"
                    y="16"
                    fill="#FFF"
                    fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    fontSize="8"
                    fontWeight="500"
                  >
                    Download on the
                  </text>
                  <text
                    x="36"
                    y="29"
                    fill="#FFF"
                    fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    fontSize="13"
                    fontWeight="700"
                  >
                    App Store
                  </text>
                </svg>
              </button>
              <span className={styles.comingSoonBadge} data-testid="coming-soon-badge-app-store">
                Coming Soon
              </span>
            </div>

            {/* Play Store Badge */}
            <div className={styles.badgeWrapper} data-testid="google-play-wrapper">
              <button
                type="button"
                disabled
                className={styles.badgeButton}
                aria-label="Get it on Google Play - Coming Soon"
                data-testid="download-badge-google-play"
              >
                <svg
                  viewBox="0 0 135 40"
                  width="100%"
                  height="100%"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="0.5"
                    y="0.5"
                    width="134"
                    height="39"
                    rx="5"
                    fill="#000"
                    stroke="#A6A6A6"
                    strokeWidth="1"
                  />
                  <g transform="translate(10, 8) scale(0.9)">
                    <path
                      d="M1,1.75 C1.08,1.68 1.18,1.64 1.29,1.64 C1.4,1.64 1.5,1.69 1.57,1.77 L12.35,12.55 L1.88,23.02 C1.77,22.95 1.68,22.84 1.68,22.71 C1.68,22.58 1.77,22.47 1.88,22.4 L1.88,2.37 C1.88,2.1 1.48,1.83 1,1.75 Z"
                      fill="#EA4335"
                    />
                    <path
                      d="M12.35,12.55 L1.57,1.77 C1.67,1.66 1.84,1.59 2.01,1.59 C2.28,1.59 2.52,1.73 2.66,1.96 L16.32,10.02 C16.58,10.17 16.74,10.45 16.74,10.76 C16.74,11.07 16.58,11.35 16.32,11.5 L12.35,12.55 Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12.35,12.55 L16.32,11.5 L20.29,12.55 C20.59,12.69 20.78,12.99 20.78,13.33 C20.78,13.67 20.59,13.97 20.29,14.11 L2.66,24.7 C2.52,24.93 2.28,25.07 2.01,25.07 C1.84,25.07 1.67,25 1.57,24.89 L12.35,12.55 Z"
                      fill="#34A853"
                    />
                    <path
                      d="M12.35,12.55 L1.57,24.89 C1.5,24.97 1.4,25.02 1.29,25.02 C1.18,25.02 1.08,24.98 1,24.91 L12.35,12.55 Z"
                      fill="#FBBC05"
                    />
                  </g>
                  <text
                    x="38"
                    y="15"
                    fill="#FFF"
                    fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    fontSize="7"
                    fontWeight="500"
                  >
                    GET IT ON
                  </text>
                  <text
                    x="38"
                    y="29"
                    fill="#FFF"
                    fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    fontSize="13"
                    fontWeight="700"
                  >
                    Google Play
                  </text>
                </svg>
              </button>
              <span className={styles.comingSoonBadge} data-testid="coming-soon-badge-google-play">
                Coming Soon
              </span>
            </div>
          </div>
        </section>
      </div>
    </ScreenView>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
