"use client";

import type { ReactNode } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  LibraryTabs,
  type LibraryTab,
} from "@/features/library/components/library-tabs/library-tabs";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";

import styles from "./library-shell.module.css";

type LibraryShellProps = {
  activeTab: LibraryTab;
  children: ReactNode;
};

export function LibraryShell({ activeTab, children }: LibraryShellProps) {
  const { t } = useTranslation();

  return (
    <ScreenView contentStyle={{ flex: 1 }} backgroundVariant="mixedWash">
      <div className={styles.screen}>
        <header className={styles.header}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>{t("library.eyebrow", "Personal study")}</p>
            <h1 className={styles.title}>{t("library.title", "Library")}</h1>
            <p className={styles.description}>
              {t(
                "library.description",
                "Pick up where you left off, revisit saved lessons, or review what you have completed.",
              )}
            </p>
          </div>
          <LibraryTabs activeTab={activeTab} />
        </header>
        <main className={styles.content}>{children}</main>
        <ScrollToTopButton />
      </div>
    </ScreenView>
  );
}
