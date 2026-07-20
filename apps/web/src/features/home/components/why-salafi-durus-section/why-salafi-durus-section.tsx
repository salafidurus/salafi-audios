"use client";

import { ShieldCheck, WifiOff, Heart } from "lucide-react";
import { AppText } from "@/shared/components/AppText/AppText";
import { FeatureCard } from "../feature-card/feature-card";
import styles from "./why-salafi-durus-section.module.css";

const FEATURES = [
  {
    icon: <ShieldCheck size={20} />,
    title: "Verified Scholars",
    description: "Audio lectures from trusted Salafi scholars, carefully curated for authentic Islamic knowledge.",
    testId: "feature-card-scholars",
  },
  {
    icon: <WifiOff size={20} />,
    title: "Offline Sync",
    description: "Download lectures and listen on-the-go with our upcoming mobile apps. No internet connection needed.",
    testId: "feature-card-offline",
  },
  {
    icon: <Heart size={20} />,
    title: "Seeking His Pleasure",
    description: "Purely seeking the pleasure of Allah ﷻ. No ads, no social media, no distractions.",
    testId: "feature-card-pleasure",
  },
];

export function WhySalafiDurusSection() {
  return (
    <section
      className={styles.featuresSection}
      aria-label="Platform features"
      data-testid="features-section"
    >
      <AppText variant="titleLg">
        <span data-testid="features-section-title">Why Salafi Durus</span>
      </AppText>
      <div className={styles.featuresGrid} data-testid="features-grid">
        {FEATURES.map((feature) => (
          <FeatureCard
            key={feature.testId}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            testId={feature.testId}
          />
        ))}
      </div>
    </section>
  );
}
