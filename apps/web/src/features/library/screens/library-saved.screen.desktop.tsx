"use client";

import React from "react";
import { useLibrarySavedScreen } from "@sd/domain-content";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { EmptyState } from "@/shared/components/EmptyState";
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
      <PageHeader title={t("library.saved", "Saved")} />

      {isFetching && items.length === 0 ? (
        <EmptyState
          variant="loading"
          message={t("library.loadingSection", "Loading {{section}}…", {
            section: t("library.saved", "Saved"),
          })}
        />
      ) : items.length === 0 ? (
        <EmptyState
          message={t(
            "library.emptySaved",
            "No saved lectures yet. Save lectures to listen to later.",
          )}
        />
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <LibraryListRow key={item.id} item={item} variant="saved" />
          ))}
        </div>
      )}
    </ScreenView>
  );
}
