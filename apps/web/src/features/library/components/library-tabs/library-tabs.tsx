"use client";

import { routes } from "@sd/core-contracts";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

import styles from "./library-tabs.module.css";

export type LibraryTab = "started" | "saved" | "completed";

type LibraryTabsProps = {
  activeTab: LibraryTab;
};

export function LibraryTabs({ activeTab }: LibraryTabsProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.viewport}>
      <Tabs value={activeTab} orientation="horizontal" className={styles.tabs}>
        <TabsList
          variant="line"
          className={styles.list}
          aria-label={t("navigation.subnav.library.label", "Library sections")}
        >
          <TabsTrigger value="started" asChild className={styles.trigger}>
            <Link href={routes.library.index}>
              {t("navigation.subnav.library.started", "Started")}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="saved" asChild className={styles.trigger}>
            <Link href={routes.library.saved}>{t("library.saved", "Saved")}</Link>
          </TabsTrigger>
          <TabsTrigger value="completed" asChild className={styles.trigger}>
            <Link href={routes.library.completed}>{t("library.completed", "Completed")}</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
