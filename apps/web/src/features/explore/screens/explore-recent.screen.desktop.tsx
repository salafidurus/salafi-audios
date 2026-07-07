"use client";

import type { ReactNode } from "react";
import type { FeedItemDto, FeedContentItemDto } from "@sd/core-contracts";
import { getEmptyStateText, getErrorStateText } from "@sd/core-i18n";
import { useExploreRecentScreen } from "@sd/domain-content";
import { useTranslation } from "@/core/i18n/use-translation";
import { FeedListRow } from "../components/feed-list-row/feed-list-row";
import { FeedScholarRow } from "../components/feed-scholar-row/feed-scholar-row";
import { FeedTopicRow } from "../components/feed-topic-row/feed-topic-row";
import { FeedSkeleton } from "../components/feed-skeleton/feed-skeleton";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./explore-recent.screen.desktop.module.css";

export type FeedDesktopScreenProps = {
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

function getFeedItemKey(item: FeedItemDto): string {
  if (item.kind === "scholar_row") return "scholar-row";
  if (item.kind === "topic_row") return `topic-row-${item.topicName}`;
  return item.id;
}

type FeedBlocksProps = {
  items: FeedItemDto[];
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

/**
 * Render the feed as a responsive list of content rows, with scholar/topic
 * carousels breaking out to full-width sections in their original order.
 */
function FeedBlocks({ items, onNavigateToLecture, onNavigateToScholar }: FeedBlocksProps) {
  const blocks: ReactNode[] = [];
  let cards: ReactNode[] = [];

  const flushCards = (key: string) => {
    if (cards.length === 0) return;
    blocks.push(
      <div className={styles.list} key={`list-${key}`}>
        {cards}
      </div>,
    );
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
            onItemPress={onNavigateToLecture}
          />
        </section>,
      );
    } else {
      cards.push(
        <FeedListRow
          key={item.id}
          item={item as FeedContentItemDto}
          onPress={() => onNavigateToLecture?.(item.slug)}
        />,
      );
    }
  });

  flushCards("end");
  return <>{blocks}</>;
}

export function FeedDesktopScreen({
  onNavigateToLecture,
  onNavigateToScholar,
}: FeedDesktopScreenProps) {
  const { t } = useTranslation();
  const { data, isFetching, isError, hasNextPage, fetchNextPage, refetch } = useExploreRecentScreen();
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  const hero = (
    <header className={styles.hero}>
      <h2 className={styles.heroTitle}>Feed</h2>
      <p className={styles.heroSubtitle}>Scholarly, calm, and authentic Islamic knowledge</p>
    </header>
  );

  let body: ReactNode;
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
          onNavigateToLecture={onNavigateToLecture}
          onNavigateToScholar={onNavigateToScholar}
        />
        {hasNextPage && (
          <div className={styles.loadMoreRow}>
            <button
              type="button"
              className={styles.button}
              onClick={() => fetchNextPage()}
              disabled={isFetching}
            >
              {isFetching ? t("feed.loading", "Loading…") : t("feed.loadMore", "Load more")}
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <ScreenView>
      <div className={styles.page}>
        {hero}
        {body}
      </div>
    </ScreenView>
  );
}
