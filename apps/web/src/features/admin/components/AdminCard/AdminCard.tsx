"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./AdminCard.module.css";

export interface AdminCardMetadataItem {
  /** Metadata label (e.g., "Email", "Role", "Permissions") */
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

export function AdminCard({
  thumbnail,
  title,
  subtitle,
  metadata,
  actions,
  onClick,
  className,
}: AdminCardProps) {
  const { t } = useTranslation();
  // Track which expandable items are expanded by label
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const isThumbnailImage = thumbnail && typeof thumbnail === "object" && "src" in thumbnail;

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
      {thumbnail && (
        <div className={styles.thumbnail}>
          {isThumbnailImage ? (
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
      )}

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        <div className={styles.metadata}>
          {metadata.map((item) => {
            const isExpanded = expandedItems.has(item.label);
            const shouldTruncate = item.truncate && !isExpanded;

            return (
              <div key={item.label} className={styles.metadataItem}>
                <span className={styles.metadataLabel}>{item.label}:</span>
                <span
                  className={shouldTruncate ? styles.metadataValueTruncated : styles.metadataValue}
                >
                  {item.value}
                </span>
                {item.expandable && (
                  <button
                    type="button"
                    className={styles.expandButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(item.label);
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
          })}
        </div>
      </div>

      <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
        {actions}
      </div>
    </div>
  );
}
