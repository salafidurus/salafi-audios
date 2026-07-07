"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./admin-contents.screen.desktop.module.css";

export function AdminContentsDesktopScreen() {
  return (
    <ScreenView>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Admin Contents</h1>
        <p className={styles.description}>
          Content management for series, collections, and metadata will appear here.
        </p>
      </div>
    </ScreenView>
  );
}
