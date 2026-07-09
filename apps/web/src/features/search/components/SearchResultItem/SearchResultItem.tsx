"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Headphones, Clock } from "lucide-react";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
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
  const [isPressed, setIsPressed] = useState(false);

  if (isDesktop) {
    return (
      <article className={styles.card} onClick={onPress}>
        <div className={styles.media}>
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 20vw, 10vw"
              className={styles.cover}
            />
          ) : (
            <div className={styles.fallback}>
              <Headphones size={22} style={{ color: "var(--content-subtle)" }} aria-hidden />
            </div>
          )}
        </div>

        <div className={styles.body}>
          <MarqueeText
            text={item.title}
            className="truncate text-[var(--content-strong)] [font-size:var(--typo-title-md-font-size)] xl:[font-size:var(--typo-title-lg-font-size)]"
          />
          <MarqueeText
            text={item.scholarName}
            className="truncate text-[var(--content-muted)] [font-size:var(--typo-body-sm-font-size)] xl:[font-size:var(--typo-body-md-font-size)]"
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

        <div className={styles.playButton}>
          <button
            type="button"
            aria-label={`Play ${item.title}`}
            className={styles.playButtonInner}
          >
            <Play size={16} fill="currentColor" />
          </button>
        </div>
      </article>
    );
  }

  return (
    <button
      type="button"
      className={styles.mobileCard}
      onClick={onPress}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      style={{
        background: isPressed ? "var(--accent-primary-subtle-surface)" : "var(--surface-default)",
        borderColor: isPressed ? "var(--accent-primary-subtle-border)" : "var(--border-subtle)",
      }}
    >
      <div className={styles.mobileMedia}>
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 30vw, 20vw"
            className={styles.cover}
          />
        ) : (
          <div className={styles.fallback}>
            <Headphones size={20} color="var(--content-subtle)" />
          </div>
        )}
      </div>
      <div className={styles.mobileBody}>
        <MarqueeText text={item.title} className="text-[var(--content-strong)]" />
        <MarqueeText text={item.scholarName} className="text-[var(--content-muted)]" />
        <div className={styles.metaRow}>
          <Headphones size={11} color="var(--content-muted)" />
          <span
            style={{
              color: "var(--content-muted)",
              fontFamily: "var(--typo-caption-font-family)",
              fontSize: "var(--typo-caption-font-size)",
              lineHeight: "var(--typo-caption-line-height)",
              letterSpacing: "var(--typo-caption-letter-spacing)",
              fontWeight: "var(--typo-caption-font-weight)",
            }}
          >
            {formatLectureCount(item.lectureCount)}
          </span>
          {formatDuration(item.durationSeconds) ? (
            <>
              <span
                style={{
                  color: "var(--content-muted)",
                  fontFamily: "var(--typo-caption-font-family)",
                  fontSize: "var(--typo-caption-font-size)",
                  lineHeight: "var(--typo-caption-line-height)",
                  letterSpacing: "var(--typo-caption-letter-spacing)",
                  fontWeight: "var(--typo-caption-font-weight)",
                }}
              >
                {" "}
                ·{" "}
              </span>
              <Clock size={11} color="var(--content-muted)" />
              <span
                style={{
                  color: "var(--content-muted)",
                  fontFamily: "var(--typo-caption-font-family)",
                  fontSize: "var(--typo-caption-font-size)",
                  lineHeight: "var(--typo-caption-line-height)",
                  letterSpacing: "var(--typo-caption-letter-spacing)",
                  fontWeight: "var(--typo-caption-font-weight)",
                }}
              >
                {formatDuration(item.durationSeconds)}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </button>
  );
}
