"use client";

import styles from "./admin-stats.screen.mobile.module.css";

export function AdminStatsMobileScreen() {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Admin Stats</h1>
      <p className={styles.description}>Platform statistics and analytics will appear here.</p>
    </div>
  );
}
