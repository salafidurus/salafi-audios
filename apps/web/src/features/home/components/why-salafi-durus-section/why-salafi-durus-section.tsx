"use client";

import { Users, Sparkles } from "lucide-react";
import { FeatureCard } from "../feature-card/feature-card";
import styles from "./why-salafi-durus-section.module.css";

const FEATURES = [
  {
    icon: <Users size={24} />,
    title: "Known Salafi Scholars & Students of Knowledge",
    description: "Audio lectures from trusted scholars. Authentic Islamic knowledge.",
    testId: "feature-card-scholars",
  },
  {
    icon: <Sparkles size={24} />,
    title: "No Distraction",
    description: "Purely seeking the pleasure of Allah ﷻ. No ads, no social media.",
    testId: "feature-card-distraction",
  },
];

export function WhySalafiDurusSection() {
  return (
    <section
      className={styles.featuresSection}
      aria-label="Platform features"
      data-testid="features-section"
    >
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
