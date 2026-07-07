"use client";

import type { ReactNode } from "react";
import type { FeedItemDto, FeedContentItemDto } from "@sd/core-contracts";
import { FeedListRow } from "../components/feed-list-row/feed-list-row";
import { FeedScholarRow } from "../components/feed-scholar-row/feed-scholar-row";
import { useExploreFollowingScreen } from "@sd/domain-content";
import styles from "./explore-following.screen.mobile.module.css";

export type FeedFollowingMobileScreenProps = {
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

type FeedBlocksProps = {
  items: FeedItemDto[];
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

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
        <section className={styles.section} key={`scholar-row-${index}`}>
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

export function FeedFollowingMobileScreen({
  onNavigateToLecture,
  onNavigateToScholar,
}: FeedFollowingMobileScreenProps) {
  const { data, isFetching, hasNextPage, fetchNextPage } = useExploreFollowingScreen();
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (isFetching && items.length === 0) {
    return <div style={{ padding: 16 }}>Loading followed scholars…</div>;
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: 16, color: "var(--content-muted)" }}>
        Follow scholars to see their latest lectures here.
      </div>
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <h2 className={styles.title}>Following</h2>
      <FeedBlocks
        items={items}
        onNavigateToLecture={onNavigateToLecture}
        onNavigateToScholar={onNavigateToScholar}
      />
      {hasNextPage && (
        <div className={styles.loadMoreRow}>
          <button type="button" onClick={() => fetchNextPage()} className={styles.button}>
            {isFetching ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
