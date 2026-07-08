"use client";

import React from "react";
import { useLibraryProgressScreen } from "@sd/domain-content";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { EmptyState } from "@/shared/components/EmptyState";
import { LibraryListRow } from "../components/library-list-row/library-list-row";
import styles from "./library-screens.module.css";

export function LibraryMobileScreen() {
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
      <PageHeader title={t("library.inProgress", "In Progress")} />

      {isFetching && items.length === 0 ? (
        <EmptyState
          variant="loading"
          message={t("library.loadingSection", "Loading {{section}}…", {
            section: t("library.inProgress", "In Progress"),
          })}
        />
      ) : items.length === 0 ? (
        <EmptyState message={t("library.emptyProgress", "No lectures in progress.")} />
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <LibraryListRow key={item.id} item={item} variant="progress" />
          ))}
        </div>
      )}
    </ScreenView>
  );
}
