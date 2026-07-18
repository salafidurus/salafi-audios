"use client";

import React from "react";
import { queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { LibraryListRow } from "../components/library-list-row/library-list-row";
import type { LibraryPageDto } from "@sd/core-contracts";
import styles from "./library-screens.module.css";

export function LibraryCompletedScreen() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

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

      <div className={styles.list}>
        <InfiniteScrollList
          queryKey={[...queryKeys.library.completed.infinite()]}
          queryFn={async ({ pageParam }: { pageParam?: string | undefined }) => {
            const params = new URLSearchParams();
            if (pageParam) params.append("cursor", pageParam);
            const url = `${endpoints.library.completed}${params.size > 0 ? `?${params}` : ""}`;
            const response = await httpClient<LibraryPageDto>({ url, method: "GET" });
            return {
              items: response.items,
              nextCursor: response.nextCursor,
              hasMore: response.hasMore,
            };
          }}
          renderItem={(item) => <LibraryListRow key={item.id} item={item} variant="completed" />}
          emptyMessage={t("library.emptyCompleted", "No completed lectures yet. Keep listening!")}
        />
      </div>
    </ScreenView>
  );
}
