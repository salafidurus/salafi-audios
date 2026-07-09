"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import styles from "./admin-stats.screen.module.css";

export function AdminStatsScreen() {
  return (
    <ScreenView>
      <PageHeader title="Admin Stats" />
      <p className={styles.description}>Platform statistics and analytics will appear here.</p>
    </ScreenView>
  );
}
