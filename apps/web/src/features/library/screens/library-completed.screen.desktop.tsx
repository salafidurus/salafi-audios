"use client";

import React from "react";
import { useLibraryCompletedScreen } from "@sd/domain-content";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { LibraryListRow } from "../components/library-list-row/library-list-row";
import styles from "./library-screens.module.css";

export type LibraryCompletedDesktopScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

export function LibraryCompletedDesktopScreen({
  onNavigateToLecture,
}: LibraryCompletedDesktopScreenProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { items, isFetching } = useLibraryCompletedScreen(isAuthenticated);

  if (!isAuthenticated) {
    return (
      <ScreenView>
        <AuthRequiredState
          title="Sign in to view completed history"
          description="Keep track of all lectures you have completed listening to."
        />
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <div className={styles.container}>
        <h2 className={styles.title}>
          {t("library.completed", "Completed")}
        </h2>

        {isFetching && items.length === 0 ? (
          <div className={styles.loading}>
            {t("library.loadingSection", "Loading {{section}}…", {
              section: t("library.completed", "Completed"),
            })}
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            {t("library.emptyCompleted", "No completed lectures yet. Keep listening!")}
          </div>
        ) : (
          <div className={styles.list}>
            {items.map((item) => (
              <LibraryListRow key={item.id} item={item} variant="completed" />
            ))}
          </div>
        )}
      </div>
    </ScreenView>
  );
}
