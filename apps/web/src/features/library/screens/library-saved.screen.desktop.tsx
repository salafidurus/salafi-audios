"use client";

import React from "react";
import { useLibrarySavedScreen } from "@sd/domain-content";
import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { LibraryListRow } from "../components/library-list-row/library-list-row";
import styles from "./library-screens.module.css";

export type LibrarySavedDesktopScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

export function LibrarySavedDesktopScreen({ onNavigateToLecture }: LibrarySavedDesktopScreenProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { items, isFetching } = useLibrarySavedScreen(isAuthenticated);

  return (
    <ScreenView>
      <div className={styles.container}>
        <h2 className={styles.title}>
          {t("library.saved", "Saved")}
        </h2>

        {isFetching && items.length === 0 ? (
          <div className={styles.loading}>
            {t("library.loadingSection", "Loading {{section}}…", {
              section: t("library.saved", "Saved"),
            })}
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            {t(
              "library.emptySaved",
              "No saved lectures yet. Save lectures to listen to later.",
            )}
          </div>
        ) : (
          <div className={styles.list}>
            {items.map((item) => (
              <LibraryListRow key={item.id} item={item} variant="saved" />
            ))}
          </div>
        )}
      </div>
    </ScreenView>
  );
}
