"use client";

import React from "react";
import { useLibraryCompletedScreen } from "@sd/domain-content";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { EmptyState } from "@/shared/components/EmptyState";
import { LibraryListRow } from "../components/library-list-row/library-list-row";
import styles from "./library-screens.module.css";

export function LibraryCompletedScreen() {
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
      <PageHeader title={t("library.completed", "Completed")} />

      {isFetching && items.length === 0 ? (
        <EmptyState
          variant="loading"
          message={t("library.loadingSection", "Loading {{section}}\u2026", {
            section: t("library.completed", "Completed"),
          })}
        />
      ) : items.length === 0 ? (
        <EmptyState
          message={t("library.emptyCompleted", "No completed lectures yet. Keep listening!")}
        />
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <LibraryListRow key={item.id} item={item} variant="completed" />
          ))}
        </div>
      )}
    </ScreenView>
  );
}
