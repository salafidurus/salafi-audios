"use client";

import Image from "next/image";
import { Play, Headphones, Clock } from "lucide-react";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { List } from "@/shared/components/List";
import { Button } from "@/shared/components/Button";
import { MarqueeText } from "../MarqueeText/MarqueeText";
import type { SearchResultRow } from "@sd/domain-search";
import styles from "./SearchResultItem.module.css";

export type SearchResultItemProps = {
  item: SearchResultRow;
  onPress?: () => void;
};

function formatLectureCount(count: number): string {
  return count === 1 ? "1 lecture" : `${count} lectures`;
}

function formatDuration(durationSeconds?: number): string {
  if (!durationSeconds || durationSeconds <= 0) {
    return "";
  }
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}hr ${String(minutes).padStart(2, "0")}m`;
  }
  if (minutes <= 0) {
    return "";
  }
  return `${minutes}m`;
}

export function SearchResultItem({ item, onPress }: SearchResultItemProps) {
  const isDesktop = useIsDesktop();

  return (
    <List.Item interactive onClick={onPress} className={styles.card}>
      <div className={styles.content}>
        <div className={styles.media}>
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt=""
              fill
              sizes={isDesktop ? "(max-width: 768px) 20vw, 10vw" : "(max-width: 640px) 30vw, 20vw"}
              className={styles.cover}
            />
          ) : (
            <div className={styles.fallback}>
              <Headphones
                size={isDesktop ? 22 : 20}
                style={{ color: "var(--content-subtle)" }}
                aria-hidden
              />
            </div>
          )}
        </div>

        <div className={styles.body}>
          <MarqueeText
            text={item.title}
            className={
              isDesktop
                ? "truncate text-[var(--content-strong)] [font-size:var(--typo-title-md-font-size)] xl:[font-size:var(--typo-title-lg-font-size)]"
                : "text-[var(--content-strong)]"
            }
          />
          <MarqueeText
            text={item.scholarName}
            className={
              isDesktop
                ? "truncate text-[var(--content-muted)] [font-size:var(--typo-body-sm-font-size)] xl:[font-size:var(--typo-body-md-font-size)]"
                : "text-[var(--content-muted)]"
            }
          />
          <div className={styles.metaRow}>
            <Headphones size={11} aria-hidden />
            <span>{formatLectureCount(item.lectureCount)}</span>
            {formatDuration(item.durationSeconds) ? (
              <>
                <span aria-hidden> · </span>
                <Clock size={11} aria-hidden />
                <span>{formatDuration(item.durationSeconds)}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <List.Item.Actions>
        <Button
          variant="ghost"
          size={isDesktop ? "icon" : "sm"}
          aria-label={`Play ${item.title}`}
          icon={<Play size={16} fill="currentColor" />}
        >
          {!isDesktop && "Play"}
        </Button>
      </List.Item.Actions>
    </List.Item>
  );
}
