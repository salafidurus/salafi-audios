"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@sd/core-contracts";
import { useInfiniteScholarsList } from "@sd/domain-content";
import { useTranslation } from "@/core/i18n/use-translation";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { Search } from "@/shared/components/Search";
import { PageHeader } from "@/shared/components/PageHeader";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScholarListRow } from "@/features/listing/components/scholar/scholar-list-row/scholar-list-row";
import styles from "./explore-scholar.screen.module.css";

export type ExploreScholarScreenProps = {
  onNavigateToScholar?: (slug: string) => void;
};

export function ExploreScholarScreen({ onNavigateToScholar }: ExploreScholarScreenProps) {
  const isDesktop = useIsDesktop();
  const { t } = useTranslation();
  const router = useRouter();
  const handleNavigateToScholar =
    onNavigateToScholar ?? ((slug) => router.push(routes.scholars.detail(slug)));

  const [searchValue, setSearchValue] = useState("");

  const { data, isFetching, isError, hasNextPage, fetchNextPage, refetch } =
    useInfiniteScholarsList();

  const scholars = data?.pages.flatMap((p) => p.items) ?? [];
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetching, fetchNextPage]);

  const title = t("explore.scholarsTitle", "Scholars");

  if (isDesktop) {
    let body: ReactNode;
    if (isError && scholars.length === 0) {
      body = (
        <div className={styles.state} role="alert">
          <span>{t("explore.errorScholars", "Failed to load scholars.")}</span>
          <button
            type="button"
            className={`${styles.button} ${styles.retryButton}`}
            onClick={() => refetch()}
          >
            {t("feed.retry", "Try Again")}
          </button>
        </div>
      );
    } else if (isFetching && scholars.length === 0) {
      body = <p className={styles.loading}>{t("explore.loadingScholars", "Loading scholars…")}</p>;
    } else if (scholars.length === 0) {
      body = (
        <div className={styles.state}>{t("explore.noScholars", "No scholars available.")}</div>
      );
    } else {
      body = (
        <>
          <div className={styles.list}>
            {scholars.map((scholar) => (
              <ScholarListRow
                key={scholar.id}
                scholar={scholar}
                onPress={handleNavigateToScholar}
              />
            ))}
          </div>
          <div ref={loadMoreRef} style={{ height: "20px" }} />
        </>
      );
    }

    return (
      <ScreenView contentStyle={{ flex: 1 }}>
        <StickyHeaderLayout>
          <StickyHeaderLayout.Header>
            <div className={styles.header}>
              <PageHeader title={title} />
              <Search.Bar
                value={searchValue}
                onChange={setSearchValue}
                placeholder={t("scholarContent.searchScholars", "Search scholars...")}
              />
            </div>
          </StickyHeaderLayout.Header>
          <StickyHeaderLayout.Content>
            <div className={styles.page}>{body}</div>
          </StickyHeaderLayout.Content>
        </StickyHeaderLayout>
        <ScrollToTopButton />
      </ScreenView>
    );
  }

  let body: ReactNode;
  if (isFetching && scholars.length === 0) {
    body = <p className={styles.loading}>{t("explore.loadingScholars", "Loading scholars…")}</p>;
  } else if (scholars.length === 0) {
    body = <p className={styles.empty}>{t("explore.noScholars", "No scholars available.")}</p>;
  } else {
    body = (
      <>
        <div className={styles.list}>
          {scholars.map((scholar) => (
            <ScholarListRow key={scholar.id} scholar={scholar} onPress={handleNavigateToScholar} />
          ))}
        </div>
        <div ref={loadMoreRef} style={{ height: "20px" }} />
      </>
    );
  }

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <StickyHeaderLayout>
        <StickyHeaderLayout.Header>
          <div className={styles.header}>
            <PageHeader title={title} />
            <Search.Bar
              value={searchValue}
              onChange={setSearchValue}
              placeholder={t("scholarContent.searchScholars", "Search scholars...")}
            />
          </div>
        </StickyHeaderLayout.Header>
        <StickyHeaderLayout.Content>
          <div className={styles.page}>{body}</div>
        </StickyHeaderLayout.Content>
      </StickyHeaderLayout>
      <ScrollToTopButton />
    </ScreenView>
  );
}
