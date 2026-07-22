"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { routes, type FeedItemDto, type FeedContentItemDto } from "@sd/core-contracts";
import { useExploreFollowingScreen } from "@sd/domain-content";
import { List } from "@/shared/components/List";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { useTranslation } from "@/core/i18n/use-translation";
import { Button } from "@/shared/components/Button";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { FeedListRow } from "../components/explore-list-row/explore-list-row";
import { FeedScholarRow } from "../components/feed-scholar-row/feed-scholar-row";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";
import styles from "./explore-following.screen.module.css";

export type FeedFollowingScreenProps = {
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
    } else if (item.kind !== "topic_row") {
      const contentItem = item as FeedContentItemDto;
      cards.push(
        <FeedListRow
          key={contentItem.id}
          item={contentItem}
          onPress={() => onNavigateToListing?.(contentItem.slug)}
        />,
      );
    }
  });

  flushCards("end");
  return <>{blocks}</>;
}

export function FeedFollowingScreen({
  onNavigateToListing,
  onNavigateToScholar,
}: FeedFollowingScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { navigateToListing } = useListingNavigation();
  const handleNavigateToListing = onNavigateToListing ?? navigateToListing;
  const handleNavigateToScholar =
    onNavigateToScholar ?? ((slug) => router.push(routes.scholars.detail(slug)));

  const { data, isFetching, hasNextPage, fetchNextPage } = useExploreFollowingScreen();
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

  const followingTitle = t("navigation.subnav.explore.following", "Following");

  if (isFetching && items.length === 0) {
    return (
      <ScreenView contentStyle={{ flex: 1 }}>
        <StickyHeaderLayout>
          <StickyHeaderLayout.Header>
            <PageHeader title={followingTitle} />
          </StickyHeaderLayout.Header>
          <StickyHeaderLayout.Content>
            <div className={styles.loading}>
              {t("explore.loadingFollowing", "Loading followed scholars…")}
            </div>
          </StickyHeaderLayout.Content>
        </StickyHeaderLayout>
        <ScrollToTopButton />
      </ScreenView>
    );
  }

  if (items.length === 0) {
    return (
      <ScreenView contentStyle={{ flex: 1 }}>
        <StickyHeaderLayout>
          <StickyHeaderLayout.Header>
            <PageHeader title={followingTitle} />
          </StickyHeaderLayout.Header>
          <StickyHeaderLayout.Content>
            <div className={styles.empty}>
              {t("explore.followToSee", "Follow scholars to see their latest lectures here.")}
            </div>
          </StickyHeaderLayout.Content>
        </StickyHeaderLayout>
        <ScrollToTopButton />
      </ScreenView>
    );
  }

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <div className={styles.stickyHeader}>
        <PageHeader title={followingTitle} />
      </div>
      <section className={styles.results}>
        <FeedBlocks
          items={items}
          onNavigateToListing={handleNavigateToListing}
          onNavigateToScholar={handleNavigateToScholar}
        />
        <div ref={loadMoreRef} style={{ height: "20px" }} />
      </section>
      <ScrollToTopButton />
    </ScreenView>
  );
}
