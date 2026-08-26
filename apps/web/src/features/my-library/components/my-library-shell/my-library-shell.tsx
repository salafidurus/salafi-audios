"use client";

import type { ReactNode } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  MyLibraryTabs,
  type MyLibraryTab,
} from "@/features/my-library/components/my-library-tabs/my-library-tabs";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { Separator } from "@/shared/components/ui/separator";

import styles from "./my-library-shell.module.css";

type MyLibraryShellProps = {
  activeTab: MyLibraryTab;
  children: ReactNode;
};

export function MyLibraryShell({ activeTab, children }: MyLibraryShellProps) {
  const { t } = useTranslation();

  return (
    <ScreenView contentStyle={{ flex: 1 }} backgroundVariant="mixedWash">
      <div className={styles.screen}>
        <header className={styles.header}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>{t("myLibrary.eyebrow", "Personal study")}</p>
            <h1 className={styles.title}>{t("myLibrary.title", "My Library")}</h1>
            <p className={styles.description}>
              {t(
                "myLibrary.description",
                "Pick up where you left off, revisit saved lessons, or review what you have completed.",
              )}
            </p>
          </div>
          <MyLibraryTabs activeTab={activeTab} />
        </header>
        <Separator />
        <main className={styles.content}>{children}</main>
        <ScrollToTopButton />
      </div>
    </ScreenView>
  );
}
