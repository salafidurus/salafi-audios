"use client";

import type { ReactNode } from "react";
import type { FeedItemDto, FeedContentItemDto } from "@sd/core-contracts";
import { useExploreFollowingScreen } from "@sd/domain-content";
import { ListContainer } from "@/shared/components/ListContainer";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { FeedListRow } from "../components/feed-list-row/feed-list-row";
import { FeedScholarRow } from "../components/feed-scholar-row/feed-scholar-row";
import styles from "./explore-following.screen.module.css";

export type FeedFollowingScreenProps = {
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
    blocks.push(<ListContainer key={`list-${key}`}>{cards}</ListContainer>);
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
  const { data, isFetching, hasNextPage, fetchNextPage } = useExploreFollowingScreen();
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (isFetching && items.length === 0) {
    return (
      <ScreenView>
        <PageHeader title="Following" />
        <div className={styles.loading}>Loading followed scholars\u2026</div>
      </ScreenView>
    );
  }

  if (items.length === 0) {
    return (
      <ScreenView>
        <PageHeader title="Following" />
        <div className={styles.empty}>Follow scholars to see their latest lectures here.</div>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <PageHeader title="Following" />
      <FeedBlocks
        items={items}
        onNavigateToLecture={onNavigateToLecture}
        onNavigateToScholar={onNavigateToScholar}
      />
      {hasNextPage && (
        <div className={styles.loadMoreRow}>
          <button type="button" onClick={() => fetchNextPage()} className={styles.button}>
            {isFetching ? "Loading\u2026" : "Load more"}
          </button>
        </div>
      )}
    </ScreenView>
  );
}
