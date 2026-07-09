"use client";

import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import styles from "./admin-stats.screen.module.css";

export function AdminStatsScreen() {
  const isDesktop = useIsDesktop();

  return (
    <ScreenView>
      <PageHeader title={isDesktop ? "Admin Stats" : "Admin Stats"} />
      <p className={styles.description}>Platform statistics and analytics will appear here.</p>
    </ScreenView>
  );
}
