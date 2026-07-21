"use client";

import type { ReactNode } from "react";
import type { FeedItemDto, FeedContentItemDto } from "@sd/core-contracts";
import { getEmptyStateText, getErrorStateText } from "@sd/core-i18n";
import { useExploreRecentScreen } from "@sd/domain-content";
import { useTranslation } from "@/core/i18n/use-translation";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { List } from "@/shared/components/List";
import { FeedListRow } from "../components/feed-list-row/feed-list-row";
import { FeedScholarRow } from "../components/feed-scholar-row/feed-scholar-row";
import { FeedTopicRow } from "../components/feed-topic-row/feed-topic-row";
import { FeedSkeleton } from "../components/feed-skeleton/feed-skeleton";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Button } from "@/shared/components/Button";
import styles from "./explore-recent.screen.module.css";

export type FeedRecentScreenProps = {
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

export function FeedRecentScreen({
  onNavigateToLecture,
  onNavigateToScholar,
}: FeedRecentScreenProps) {
  const isDesktop = useIsDesktop();
  const { t } = useTranslation();
  const { data, isFetching, isError, hasNextPage, fetchNextPage, refetch } =
    useExploreRecentScreen();
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  let body: ReactNode;

  if (isDesktop) {
    if (isError && items.length === 0) {
      body = (
        <div className={styles.state} role="alert">
          <span>{getErrorStateText("feed", t)}</span>
          <Button variant="outline" radius="md" onClick={() => refetch()}>
            {t("feed.retry", "Try Again")}
          </Button>
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
              <Button
                variant="surface"
                radius="md"
                onClick={() => fetchNextPage()}
                disabled={isFetching}
              >
                {isFetching ? t("feed.loading", "Loading\u2026") : t("feed.loadMore", "Load more")}
              </Button>
            </div>
          )}
        </>
      );
    }

    return (
      <ScreenView>
        <PageHeader title="Feed" />
        <div className={styles.page}>{body}</div>
      </ScreenView>
    );
  }

  if (isFetching && items.length === 0) {
    body = <p className={styles.loading}>Loading feed\u2026</p>;
  } else if (items.length === 0) {
    body = <p className={styles.empty}>No content yet. Check back soon.</p>;
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
            <Button
              variant="surface"
              radius="md"
              onClick={() => fetchNextPage()}
              disabled={isFetching}
            >
              {isFetching ? "Loading\u2026" : "Load more"}
            </Button>
          </div>
        )}
      </>
    );
  }

  return (
    <ScreenView>
      <PageHeader title="Feed" />
      {body}
    </ScreenView>
  );
}
