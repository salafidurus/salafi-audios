"use client";

import type { ReactNode } from "react";
import { AppText } from "@/shared/components/AppText/AppText";
import styles from "./feature-card.module.css";

export type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  testId: string;
};

export function FeatureCard({ icon, title, description, testId }: FeatureCardProps) {
  return (
    <div className={styles.featureCard} data-testid={testId}>
      <div className={styles.content}>
        <div className={styles.featureIcon}>{icon}</div>
        <div className={styles.textContent}>
          <AppText variant="titleLg">
            <span data-testid={`feature-card-title-${testId.replace("feature-card-", "")}`}>
              {title}
            </span>
          </AppText>
          <AppText variant="bodyMd" style={{ color: "var(--content-default)", lineHeight: "1.6" }}>
            {description}
          </AppText>
        </div>
      </div>
    </div>
  );
}
