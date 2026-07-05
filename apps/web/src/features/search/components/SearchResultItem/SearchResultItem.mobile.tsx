"use client";

import { useState } from "react";
import Image from "next/image";
import { Headphones, Clock } from "lucide-react";
import { MarqueeTextMobile } from "../MarqueeText/MarqueeText.mobile";
import styles from "./SearchResultItem.mobile.module.css";

export type SearchResultItemProps = {
  title: string;
  scholarName: string;
  imageUrl?: string;
  lectureCount: number;
  durationSeconds?: number;
  onPress?: () => void;
};

export type SearchResultItemMobileProps = SearchResultItemProps;

export function SearchResultItemMobile({
  title,
  scholarName,
  imageUrl,
  lectureCount,
  durationSeconds,
  onPress,
}: SearchResultItemMobileProps) {
  const [isPressed, setIsPressed] = useState(false);
  const durationLabel = formatDuration(durationSeconds);

  return (
    <button
      type="button"
      onClick={onPress}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`${styles.card} ${isPressed ? styles.cardPressed : ""}`}
    >
      <div className={styles.media}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 30vw, 20vw"
            className={styles.cover}
          />
        ) : (
          <div className={styles.coverFallback}>
            <Headphones size={20} color="var(--content-subtle)" />
          </div>
        )}
      </div>
      <div className={styles.body}>
        <MarqueeTextMobile text={title} textStyle={styles.title} />
        <MarqueeTextMobile text={scholarName} textStyle={styles.scholarName} />
        <div className={styles.metaRow}>
          <Headphones size={11} color="var(--content-muted)" />
          <span className={styles.metaText}>{formatLectureCount(lectureCount)}</span>
          {durationLabel ? (
            <>
              <span className={styles.metaText}> · </span>
              <Clock size={11} color="var(--content-muted)" />
              <span className={styles.metaText}>{durationLabel}</span>
            </>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function formatLectureCount(count: number): string {
  if (count === 1) {
    return "1 lecture";
  }
  return `${count} lectures`;
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
