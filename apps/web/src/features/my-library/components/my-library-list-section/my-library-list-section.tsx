"use client";

import type { MyLibraryItemDto } from "@sd/core-contracts";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  MyLibraryListRow,
  type MyLibraryListRowProps,
} from "@/features/my-library/components/my-library-list-row/my-library-list-row";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { EmptyState } from "@/shared/components/EmptyState";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";

import styles from "./my-library-list-section.module.css";

type MyLibraryListSectionProps = {
  title: string;
  description: string;
  variant: MyLibraryListRowProps["variant"];
  authState: "loading" | "authenticated" | "unauthenticated";
  query: {
    items: MyLibraryItemDto[];
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

export function MyLibraryListSection({
  title,
  description,
  variant,
  authState,
  query,
  authCopy,
}: MyLibraryListSectionProps) {
  const { t } = useTranslation();
  const sectionKicker =
    variant === "progress"
      ? t("myLibrary.progressKicker", "Continue")
      : variant === "saved"
        ? t("myLibrary.savedKicker", "Saved")
        : t("myLibrary.completedKicker", "Completed");

  return (
    <section className={styles.section} aria-labelledby={`${variant}-myLibrary-heading`}>
      <header className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionKicker}>{sectionKicker}</p>
          <h2 id={`${variant}-myLibrary-heading`} className={styles.title}>
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
          renderItem={(item) => <MyLibraryListRow item={item} variant={variant} />}
          emptyMessage={query.emptyMessage}
        />
      ) : (
        <AuthRequiredState title={authCopy.title} description={authCopy.description} />
      )}
    </section>
  );
}
