"use client";

import type { ReactNode } from "react";
import type { FeedItemDto, FeedContentItemDto } from "@sd/core-contracts";
import { useExploreFollowingScreen } from "@sd/domain-content";
import { List } from "@/shared/components/List";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { useTranslation } from "@/core/i18n/use-translation";
import { FeedListRow } from "../components/feed-list-row/feed-list-row";
import { FeedScholarRow } from "../components/feed-scholar-row/feed-scholar-row";
import styles from "./explore-following.screen.module.css";

export type FeedFollowingScreenProps = {
  onNavigateToLecture?: (slug: string) => void;
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
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

function FeedBlocks({ items, onNavigateToLecture, onNavigateToScholar }: FeedBlocksProps) {
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
          onPress={() => onNavigateToLecture?.(contentItem.slug)}
        />,
      );
    }
  });

  flushCards("end");
  return <>{blocks}</>;
}

export function FeedFollowingScreen({
  onNavigateToLecture,
  onNavigateToScholar,
}: FeedFollowingScreenProps) {
  const { t } = useTranslation();
  const { data, isFetching, hasNextPage, fetchNextPage } = useExploreFollowingScreen();
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  const followingTitle = t("navigation.subnav.explore.following", "Following");

  if (isFetching && items.length === 0) {
    return (
      <ScreenView>
        <PageHeader title={followingTitle} />
        <div className={styles.loading}>
          {t("explore.loadingFollowing", "Loading followed scholars…")}
        </div>
      </ScreenView>
    );
  }

  if (items.length === 0) {
    return (
      <ScreenView>
        <PageHeader title={followingTitle} />
        <div className={styles.empty}>
          {t("explore.followToSee", "Follow scholars to see their latest lectures here.")}
        </div>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <PageHeader title={followingTitle} />
      <FeedBlocks
        items={items}
        onNavigateToLecture={onNavigateToLecture}
        onNavigateToScholar={onNavigateToScholar}
      />
      {hasNextPage && (
        <div className={styles.loadMoreRow}>
          <button type="button" onClick={() => fetchNextPage()} className={styles.button}>
            {isFetching ? t("common.loading", "Loading...") : t("feed.loadMore", "Load more")}
          </button>
        </div>
      )}
    </ScreenView>
  );
}
