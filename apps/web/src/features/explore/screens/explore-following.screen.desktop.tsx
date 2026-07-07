"use client";

import type { ReactNode } from "react";
import type { FeedItemDto, FeedContentItemDto } from "@sd/core-contracts";
import { FeedListRow } from "../components/feed-list-row/feed-list-row";
import { FeedScholarRow } from "../components/feed-scholar-row/feed-scholar-row";
import { useExploreFollowingScreen } from "@sd/domain-content";
import styles from "./explore-following.screen.desktop.module.css";

export type FeedFollowingDesktopScreenProps = {
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

export function FeedFollowingDesktopScreen({
  onNavigateToLecture,
  onNavigateToScholar,
}: FeedFollowingDesktopScreenProps) {
  const { data, isFetching, hasNextPage, fetchNextPage } = useExploreFollowingScreen();
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (isFetching && items.length === 0) {
    return <div style={{ padding: 32 }}>Loading followed scholars…</div>;
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: 32, color: "var(--content-muted)" }}>
        Follow scholars to see their latest lectures here.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h2 style={{ margin: 0, fontSize: 22, marginBottom: 16 }}>Following</h2>
      <FeedBlocks
        items={items}
        onNavigateToLecture={onNavigateToLecture}
        onNavigateToScholar={onNavigateToScholar}
      />
      {hasNextPage && (
        <div style={{ padding: 16, textAlign: "center" }}>
          <button
            type="button"
            onClick={() => fetchNextPage()}
            style={{
              padding: "8px 24px",
              border: "1px solid var(--border-default)",
              borderRadius: 6,
              cursor: "pointer",
              background: "var(--surface-default)",
            }}
          >
            {isFetching ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
