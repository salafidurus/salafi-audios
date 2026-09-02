/** Documents this module's responsibility and public boundary. */
"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { z } from "zod";

import { useTranslation } from "@/core/i18n/use-translation";

import styles from "./AdminCard.module.css";

export interface AdminCardMetadataItem {
  /** Metadata label (e.g., "Email", "Role", "Access") */
  label: string;
  /** Metadata value (can be string, number, or React element like badge) */
  value: React.ReactNode;
  /** If true, truncate value with ellipsis (useful for long emails) */
  truncate?: boolean;
  /** If true, show "View all" button to expand full value */
  expandable?: boolean;
}

export interface AdminCardProps {
  /** Optional thumbnail (image src/alt or custom React element like avatar) */
  thumbnail?: { src: string; alt: string } | React.ReactNode;
  /** Card title (e.g., user name, lecture title) */
  title: string;
  /** Optional subtitle (e.g., user email, scholar name) */
  subtitle?: string;
  /** Array of metadata items to display */
  metadata: AdminCardMetadataItem[];
  /** Action buttons (Edit, Delete, etc.) */
  actions: React.ReactNode;
  /** Optional click handler for entire card */
  onClick?: () => void;
  /** Optional className for container */
  className?: string;
}

const ThumbnailImageSchema = z.object({
  src: z.string(),
  alt: z.string(),
});

function isThumbnailImage(
  thumbnail: AdminCardProps["thumbnail"],
): thumbnail is { src: string; alt: string } {
  return ThumbnailImageSchema.safeParse(thumbnail).success;
}

function AdminCardThumbnail({ thumbnail }: { thumbnail: AdminCardProps["thumbnail"] }) {
  if (!thumbnail) return null;
  return (
    <div className={styles.thumbnail}>
      {isThumbnailImage(thumbnail) ? (
        <Image
          src={thumbnail.src}
          alt={thumbnail.alt}
          className={styles.image}
          width={64}
          height={64}
        />
      ) : (
        thumbnail
      )}
    </div>
  );
}

function AdminCardMetadata({ metadata }: { metadata: AdminCardMetadataItem[] }) {
  return (
    <div className={styles.metadata}>
      {metadata.map((item) => (
        <AdminCardMetadataItemView key={item.label} item={item} />
      ))}
    </div>
  );
}

function AdminCardMetadataItemView({ item }: { item: AdminCardMetadataItem }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = item.truncate && !isExpanded;
  return (
    <div className={styles.metadataItem}>
      <span className={styles.metadataLabel}>{item.label}:</span>
      <span className={shouldTruncate ? styles.metadataValueTruncated : styles.metadataValue}>
        {item.value}
      </span>
      {item.expandable && (
        <button
          type="button"
          className={styles.expandButton}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded((expanded) => !expanded);
          }}
        >
          {isExpanded ? (
            <>
              <ChevronUp size={14} /> {t("common.hide", "Hide")}
            </>
          ) : (
            <>
              <ChevronDown size={14} /> {t("common.viewAll", "View all")}
            </>
          )}
        </button>
      )}
    </div>
  );
}

export function AdminCard({
  thumbnail,
  title,
  subtitle,
  metadata,
  actions,
  onClick,
  className,
}: AdminCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`${styles.card} ${onClick ? styles.clickable : ""} ${className || ""}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <AdminCardThumbnail thumbnail={thumbnail} />

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        <AdminCardMetadata metadata={metadata} />
      </div>

      <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
        {actions}
      </div>
    </div>
  );
}
