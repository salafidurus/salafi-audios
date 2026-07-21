"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./admin-stats.screen.module.css";

export function AdminStatsScreen() {
  const { t } = useTranslation();

  return (
    <ScreenView>
      <PageHeader title={t("admin.stats.title", "Admin Stats")} />
      <p className={styles.description}>
        {t("admin.stats.desc", "Platform statistics and analytics will appear here.")}
      </p>
    </ScreenView>
  );
}
