"use client";

import styles from "./admin-contents.screen.mobile.module.css";

export function AdminContentsMobileScreen() {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Admin Contents</h1>
      <p className={styles.description}>
        Content management for series, collections, and metadata will appear here.
      </p>
    </div>
  );
}
