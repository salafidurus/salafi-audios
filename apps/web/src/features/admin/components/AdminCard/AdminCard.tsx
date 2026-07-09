"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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
  // Track which expandable items are expanded
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const isThumbnailImage = thumbnail && typeof thumbnail === "object" && "src" in thumbnail;

  return (
    <div
      className={`${styles.card} ${onClick ? styles.clickable : ""} ${className || ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {thumbnail && (
        <div className={styles.thumbnail}>
          {isThumbnailImage ? (
            <img src={thumbnail.src} alt={thumbnail.alt} className={styles.image} />
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
          {metadata.map((item, index) => {
            const isExpanded = expandedItems.has(index);
            const shouldTruncate = item.truncate && !isExpanded;

            return (
              <div key={index} className={styles.metadataItem}>
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
                      toggleExpand(index);
                    }}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp size={14} /> Hide
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} /> View all
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
