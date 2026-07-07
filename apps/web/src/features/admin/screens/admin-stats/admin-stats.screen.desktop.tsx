"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./admin-stats.screen.desktop.module.css";

export function AdminStatsDesktopScreen() {
  return (
    <ScreenView>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Admin Stats</h1>
        <p className={styles.description}>Platform statistics and analytics will appear here.</p>
      </div>
    </ScreenView>
  );
}
