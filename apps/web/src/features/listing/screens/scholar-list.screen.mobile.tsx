"use client";

import { useScholarsList } from "@sd/domain-content";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { ScholarListRow } from "@/features/listing/components/scholar/scholar-list-row/scholar-list-row";
import styles from "./scholar-list.module.css";

export type ScholarListMobileScreenProps = {
  onSelectScholar?: (slug: string) => void;
};

export function ScholarListMobileScreen({ onSelectScholar }: ScholarListMobileScreenProps) {
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
        <div className={styles.header}>
          <h1 className={styles.title}>Scholars</h1>
          <p className={styles.tagline}>Browse our database of authentic scholars</p>
        </div>
        <div className={styles.list}>
          {scholars.map((scholar) => (
            <ScholarListRow key={scholar.id} scholar={scholar} onPress={onSelectScholar} />
          ))}
        </div>
      </div>
    </ScreenView>
  );
}
