"use client";

import type { LibraryItemDto } from "@sd/core-contracts";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  LibraryListRow,
  type LibraryListRowProps,
} from "@/features/library/components/library-list-row/library-list-row";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { EmptyState } from "@/shared/components/EmptyState";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";

import styles from "./library-list-section.module.css";

type LibraryListSectionProps = {
  title: string;
  description: string;
  variant: LibraryListRowProps["variant"];
  authState: "loading" | "authenticated" | "unauthenticated";
  query: {
    items: LibraryItemDto[];
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
    hasMore: boolean;
    onLoadMore: () => void;
    isFetchingNextPage?: boolean;
    emptyMessage: string;
  };
  authCopy: {
    title: string;
    description: string;
    loadingMessage: string;
  };
};

export function LibraryListSection({
  title,
  description,
  variant,
  authState,
  query,
  authCopy,
}: LibraryListSectionProps) {
  const { t } = useTranslation();
  const sectionKicker =
    variant === "progress"
      ? t("library.progressKicker", "Continue")
      : variant === "saved"
        ? t("library.savedKicker", "Saved")
        : t("library.completedKicker", "Completed");

  return (
    <section className={styles.section} aria-labelledby={`${variant}-library-heading`}>
      <header className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionKicker}>{sectionKicker}</p>
          <h2 id={`${variant}-library-heading`} className={styles.title}>
            {title}
          </h2>
          <p className={styles.description}>{description}</p>
        </div>
      </header>

      {authState === "loading" ? (
        <EmptyState variant="loading" message={authCopy.loadingMessage} />
      ) : authState === "authenticated" ? (
        <InfiniteScrollList
          data={query.items}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={query.onRetry}
          hasMore={query.hasMore}
          onLoadMore={query.onLoadMore}
          isFetchingNextPage={query.isFetchingNextPage}
          renderItem={(item) => <LibraryListRow item={item} variant={variant} />}
          emptyMessage={query.emptyMessage}
        />
      ) : (
        <AuthRequiredState title={authCopy.title} description={authCopy.description} />
      )}
    </section>
  );
}
