"use client";

import React from "react";
import { useLibrarySavedScreen } from "@sd/domain-content";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { LibraryListRow } from "../components/library-list-row/library-list-row";
import styles from "./library-screens.module.css";

export function LibrarySavedDesktopScreen() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { items, isFetching } = useLibrarySavedScreen(isAuthenticated);

  if (!isAuthenticated) {
    return (
      <ScreenView>
        <AuthRequiredState
          title="Sign in to view saved lectures"
          description="Save lectures to build your personal listening library."
        />
      </ScreenView>
    );
  }

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
