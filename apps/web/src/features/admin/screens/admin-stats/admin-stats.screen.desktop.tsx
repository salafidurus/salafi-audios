"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import styles from "./admin-stats.screen.desktop.module.css";

export function AdminStatsDesktopScreen() {
  return (
    <ScreenView>
      <PageHeader title="Admin Stats" />
      <p className={styles.description}>Platform statistics and analytics will appear here.</p>
    </ScreenView>
  );
}
