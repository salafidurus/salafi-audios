/** Client-side tab navigation for the user's library sections. */
"use client";

import { routes } from "@sd/core-contracts";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

import styles from "./my-library-tabs.module.css";

/** URL tab values supported by the My Library route. */
export type MyLibraryTab = "started" | "saved" | "completed";

/** Active section used to mark the corresponding library tab. */
type MyLibraryTabsProps = {
  activeTab: MyLibraryTab;
};

/** Renders links for the three persisted My Library sections. */
export function MyLibraryTabs({ activeTab }: MyLibraryTabsProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.viewport}>
      <Tabs value={activeTab} orientation="horizontal" className={styles.tabs}>
        <TabsList
          variant="line"
          className={styles.list}
          aria-label={t("navigation.subnav.myLibrary.label", "My Library sections")}
        >
          <TabsTrigger value="started" asChild className={styles.trigger}>
            <Link href={routes.myLibrary.index}>
              {t("navigation.subnav.myLibrary.started", "Started")}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="saved" asChild className={styles.trigger}>
            <Link href={`${routes.myLibrary.index}?tab=saved`}>
              {t("myLibrary.saved", "Saved")}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="completed" asChild className={styles.trigger}>
            <Link href={`${routes.myLibrary.index}?tab=completed`}>
              {t("myLibrary.completed", "Completed")}
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
