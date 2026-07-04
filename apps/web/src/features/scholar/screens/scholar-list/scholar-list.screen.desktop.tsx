"use client";

import { useScholarsList } from "@sd/domain-content";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { ScholarCard } from "@/features/scholar/components/scholar-card/scholar-card";
import styles from "./scholar-list.module.css";

export type ScholarListDesktopScreenProps = {
  onSelectScholar?: (slug: string) => void;
};

export function ScholarListDesktopScreen({ onSelectScholar }: ScholarListDesktopScreenProps) {
  const { data, isFetching } = useScholarsList();
  const scholars = data?.scholars ?? [];

  if (isFetching && scholars.length === 0) {
    return (
      <ScreenView center>
        <AppText variant="bodyMd">Loading scholars…</AppText>
      </ScreenView>
    );
  }

  if (!isFetching && scholars.length === 0) {
    return (
      <ScreenView center>
        <AppText variant="bodyMd">No scholars found.</AppText>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <div className={styles.container}>
        <h1 className={styles.title}>Scholars</h1>
        <div className={styles.grid}>
          {scholars.map((scholar) => (
            <ScholarCard key={scholar.id} scholar={scholar} onPress={onSelectScholar} />
          ))}
        </div>
      </div>
    </ScreenView>
  );
}
