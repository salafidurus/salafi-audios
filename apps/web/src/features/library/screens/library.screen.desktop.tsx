"use client";

import React from "react";
import { useLibraryProgressScreen } from "@sd/domain-content";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { LibraryListRow } from "../components/library-list-row/library-list-row";
import styles from "./library-screens.module.css";

export function LibraryDesktopScreen() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { items, isFetching } = useLibraryProgressScreen(isAuthenticated);

  if (!isAuthenticated) {
    return (
      <ScreenView>
        <AuthRequiredState
          title="Sign in to view your progress"
          description="Track and resume lectures you have started listening to."
        />
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <div className={styles.container}>
        <h2 className={styles.title}>
          {t("library.inProgress", "In Progress")}
        </h2>

        {isFetching && items.length === 0 ? (
          <div className={styles.loading}>
            {t("library.loadingSection", "Loading {{section}}…", {
              section: t("library.inProgress", "In Progress"),
            })}
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            {t("library.emptyProgress", "No lectures in progress.")}
          </div>
        ) : (
          <div className={styles.list}>
            {items.map((item) => (
              <LibraryListRow key={item.id} item={item} variant="progress" />
            ))}
          </div>
        )}
      </div>
    </ScreenView>
  );
}
