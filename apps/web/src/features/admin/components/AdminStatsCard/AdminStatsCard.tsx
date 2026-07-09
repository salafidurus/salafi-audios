"use client";

import type { ReactNode } from "react";
import styles from "./AdminStatsCard.module.css";

export interface AdminStatsCardProps {
  /** Icon element (lucide-react icon) */
  icon: ReactNode;
  /** Label for the stat (e.g., "Total Scholars") */
  label: string;
  /** The value to display (usually a number) */
  value: string | number;
  /** Optional trend indicator (e.g., "+12%" or "-5%") */
  trend?: {
    label: string;
    direction: "up" | "down" | "neutral";
  };
  /** Optional onClick handler to make card clickable */
  onClick?: () => void;
  /** Optional href to make card a link */
  href?: string;
  /** Optional className for container */
  className?: string;
}

export function AdminStatsCard({
  icon,
  label,
  value,
  trend,
  onClick,
  href,
  className,
}: AdminStatsCardProps) {
  const isClickable = onClick || href;
  const content = (
    <div className={`${styles.card} ${isClickable ? styles.clickable : ""} ${className || ""}`}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>{icon}</div>
        <p className={styles.label}>{label}</p>
      </div>

      <div className={styles.body}>
        <div className={styles.valueWrapper}>
          <p className={styles.value}>{value}</p>
          {trend && (
            <div className={`${styles.trend} ${styles[`trend-${trend.direction}`]}`}>
              {trend.label}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className={styles.linkWrapper}>
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        className={styles.buttonWrapper}
        onClick={onClick}
        aria-label={`View ${label}`}
      >
        {content}
      </button>
    );
  }

  return content;
}
