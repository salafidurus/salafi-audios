"use client";

import styles from "./download-app-card.module.css";

type DownloadAppCardProps = {
  compact?: boolean;
};

export function DownloadAppCard({ compact = false }: DownloadAppCardProps) {
  return (
    <div
      className={compact ? styles.compact : styles.card}
      style={
        compact
          ? {}
          : { background: "var(--surface-subtle)", border: "1px solid var(--border-default)" }
      }
    >
      {!compact && (
        <>
          <p
            style={{
              fontFamily: "var(--typo-title-md-font-family), serif",
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            Get the app
          </p>
          <p style={{ fontSize: 12.5, color: "var(--content-muted)", marginBottom: 14 }}>
            Download durus for offline listening and pick up right where you left off, even without
            a signal.
          </p>
        </>
      )}
      <div className={styles.badges}>
        {["App Store", "Google Play"].map((label) => (
          <span
            key={label}
            className={styles.badge}
            style={{
              border: "1px solid var(--border-default)",
              background: "var(--surface-default)",
            }}
          >
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--content-default)" }}>
              {label}
            </span>
            <span
              className={styles.soon}
              style={{
                background: "var(--action-primary)",
                color: "var(--content-on-primary)",
              }}
            >
              SOON
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
