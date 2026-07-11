"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { List } from "@/shared/components/List";
import styles from "./admin-item.module.css";

export interface AdminItemMetadataItem {
  /** Metadata label (e.g., "Email", "Role", "Permissions") */
  label: string;
  /** Metadata value (can be string, number, or React element like badge) */
  value: React.ReactNode;
  /** If true, truncate value with ellipsis (useful for long emails) */
  truncate?: boolean;
  /** If true, show "View all" button to expand full value */
  expandable?: boolean;
}

export interface AdminItemProps {
  /** Optional thumbnail (image src/alt or custom React element like avatar) */
  thumbnail?: { src: string; alt: string } | React.ReactNode;
  /** Item title (e.g., user name, lecture title) */
  title: string;
  /** Optional subtitle (e.g., user email, scholar name) */
  subtitle?: string;
  /** Array of metadata items to display */
  metadata: AdminItemMetadataItem[];
  /** Action buttons (Edit, Delete, etc.) */
  actions: React.ReactNode;
  /** Optional click handler for entire item */
  onClick?: () => void;
  /** Optional className for container */
  className?: string;
}

export function AdminItem({
  thumbnail,
  title,
  subtitle,
  metadata,
  actions,
  onClick,
  className,
}: AdminItemProps) {
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

  return (
    <List.Item
      interactive={!!onClick}
      className={`${styles.card} ${onClick ? styles.clickable : ""} ${className || ""}`}
      onClick={onClick}
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

      <List.Item.Actions>
        <div onClick={(e) => e.stopPropagation()}>{actions}</div>
      </List.Item.Actions>
    </List.Item>
  );
}
