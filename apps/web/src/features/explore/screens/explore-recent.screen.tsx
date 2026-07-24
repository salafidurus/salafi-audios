"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { routes, type FeedItemDto, type FeedContentItemDto } from "@sd/core-contracts";
import { getEmptyStateText, getErrorStateText } from "@sd/core-i18n";
import { useExploreRecentScreen } from "@sd/domain-content";
import { useTranslation } from "@/core/i18n/use-translation";
import { useIsDesktop, useResponsive } from "@/shared/hooks/use-responsive";
import { List } from "@/shared/components/List";
import { FeedListRow } from "../components/explore-list-row/explore-list-row";
import { FeedScholarRow } from "../components/feed-scholar-row/feed-scholar-row";
import { FeedTopicRow } from "../components/feed-topic-row/feed-topic-row";
import { FeedSkeleton } from "../components/feed-skeleton/feed-skeleton";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/Button";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";
import styles from "./explore-recent.screen.module.css";

export type FeedRecentScreenProps = {
  onNavigateToListing?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

function getFeedItemKey(item: FeedItemDto): string {
  if (item.kind === "scholar_row") {
    return "scholar-row";
  }
  if (item.kind === "topic_row") {
    return `topic-row-${item.topicName}`;
  }
  return item.id;
}

type FeedBlocksProps = {
  items: FeedItemDto[];
  onNavigateToListing?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

function FeedBlocks({ items, onNavigateToListing, onNavigateToScholar }: FeedBlocksProps) {
  const blocks: ReactNode[] = [];
  let cards: ReactNode[] = [];

  const flushCards = (key: string) => {
    if (cards.length === 0) {
      return;
    }
    blocks.push(<List key={`list-${key}`}>{cards}</List>);
    cards = [];
  };

  items.forEach((item, index) => {
    if (item.kind === "scholar_row") {
      flushCards(String(index));
      blocks.push(
        <section className={styles.section} key={getFeedItemKey(item)}>
          <FeedScholarRow scholars={item.scholars} onScholarPress={onNavigateToScholar} />
        </section>,
      );
    } else if (item.kind === "topic_row") {
      flushCards(String(index));
      blocks.push(
        <section className={styles.section} key={getFeedItemKey(item)}>
          <FeedTopicRow
            topicName={item.topicName}
            items={item.items}
            onItemPress={onNavigateToListing}
          />
        </section>,
      );
    } else {
      cards.push(
        <FeedListRow
          key={item.id}
          item={item as FeedContentItemDto}
          onPress={() => onNavigateToListing?.(item.slug)}
        />,
      );
    }
  });

  flushCards("end");
  return <>{blocks}</>;
}

export function FeedRecentScreen({
  onNavigateToListing,
  onNavigateToScholar,
}: FeedRecentScreenProps) {
  const isDesktop = useIsDesktop();
  const { isMobile } = useResponsive();
  const { t } = useTranslation();
  const router = useRouter();
  const { navigateToListing } = useListingNavigation();
  const handleNavigateToListing = onNavigateToListing ?? navigateToListing;
  const handleNavigateToScholar =
    onNavigateToScholar ?? ((slug) => router.push(routes.scholars.detail(slug)));

  const { data, isFetching, isError, hasNextPage, fetchNextPage, refetch } =
    useExploreRecentScreen();
  const items = data?.pages.flatMap((p) => p.items) ?? [];
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

  let body: ReactNode;
  const feedTitle = isMobile
    ? t("explore.recentTitleMobile", "Recent")
    : t("explore.recentTitleWide", "Recent Listings");

  if (isDesktop) {
    if (isError && items.length === 0) {
      body = (
        <div className={styles.state} role="alert">
          <span>{getErrorStateText("feed", t)}</span>
          <button
            type="button"
            className={`${styles.button} ${styles.retryButton}`}
            onClick={() => refetch()}
          >
            {t("feed.retry", "Try Again")}
          </button>
        </div>
      );
    } else if (isFetching && items.length === 0) {
      body = <FeedSkeleton />;
    } else if (items.length === 0) {
      body = <div className={styles.state}>{getEmptyStateText("feed", t)}</div>;
    } else {
      body = (
        <>
          <FeedBlocks
            items={items}
            onNavigateToListing={handleNavigateToListing}
            onNavigateToScholar={handleNavigateToScholar}
          />
          <div ref={loadMoreRef} style={{ height: "20px" }} />
        </>
      );
    }

    return (
      <ScreenView contentStyle={{ flex: 1 }}>
        <StickyHeaderLayout>
          <StickyHeaderLayout.Header>
            <PageHeader title={feedTitle} />
          </StickyHeaderLayout.Header>
          <StickyHeaderLayout.Content>
            <div className={styles.page}>{body}</div>
          </StickyHeaderLayout.Content>
        </StickyHeaderLayout>
        <ScrollToTopButton />
      </ScreenView>
    );
  }

  if (isFetching && items.length === 0) {
    body = <p className={styles.loading}>{t("explore.loadingFeed", "Loading feed…")}</p>;
  } else if (items.length === 0) {
    body = (
      <p className={styles.empty}>{t("explore.noContent", "No content yet. Check back soon.")}</p>
    );
  } else {
    body = (
      <>
        <FeedBlocks
          items={items}
          onNavigateToListing={handleNavigateToListing}
          onNavigateToScholar={handleNavigateToScholar}
        />
        <div ref={loadMoreRef} style={{ height: "20px" }} />
      </>
    );
  }

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <StickyHeaderLayout>
        <StickyHeaderLayout.Header>
          <PageHeader title={feedTitle} />
        </StickyHeaderLayout.Header>
        <StickyHeaderLayout.Content>{body}</StickyHeaderLayout.Content>
      </StickyHeaderLayout>
      <ScrollToTopButton />
    </ScreenView>
  );
}
