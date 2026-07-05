"use client";

import React from "react";
import type { FeedItemDto, FeedContentItemDto } from "@sd/core-contracts";
import { useFeedRecentScreen } from "@sd/domain-content";
import { FeedListRow } from "../components/feed-list-row/feed-list-row";
import { FeedScholarRow } from "../components/feed-scholar-row/feed-scholar-row";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./feed-recent.screen.mobile.module.css";

export type FeedMobileScreenProps = {
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

type FeedBlocksProps = {
  items: FeedItemDto[];
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

function FeedBlocks({ items, onNavigateToLecture, onNavigateToScholar }: FeedBlocksProps) {
  const blocks: React.ReactNode[] = [];
  let cards: React.ReactNode[] = [];

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
    } else if (item.kind === "topic_row") {
      flushCards(String(index));
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

export function FeedMobileScreen({
  onNavigateToLecture,
  onNavigateToScholar,
}: FeedMobileScreenProps) {
  const { data, isFetching, hasNextPage, fetchNextPage } = useFeedRecentScreen();
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <ScreenView>
      {isFetching && items.length === 0 ? (
        <p>Loading feed…</p>
      ) : items.length === 0 ? (
        <p>No content yet. Check back soon.</p>
      ) : (
        <>
          <h2 className={styles.title}>Feed</h2>
          <p className={styles.subtitle}>Scholarly, calm, and authentic Islamic knowledge</p>
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
        </>
      )}
    </ScreenView>
  );
}
