"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { useScholarDetail } from "@sd/domain-content";
import { ScholarHeader } from "@/features/listing/components/scholar/scholar-header/scholar-header";
import { ScholarContentList } from "@/features/listing/components/scholar/scholar-content-list/scholar-content-list";
import styles from "./scholar-detail.screen.mobile.module.css";

export type ScholarDetailMobileScreenProps = {
  slug: string;
};

export function ScholarDetailMobileScreen({ slug }: ScholarDetailMobileScreenProps) {
  const { data: scholar, isFetching } = useScholarDetail(slug);

  if (isFetching) {
    return (
      <ScreenView center>
        <AppText variant="bodyMd">Loading scholar…</AppText>
      </ScreenView>
    );
  }

  if (!scholar) {
    return (
      <ScreenView center>
        <AppText variant="titleMd">Scholar not found</AppText>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <ScholarHeader scholar={scholar} />
      <div className={styles.content}>
        <ScholarContentList slug={slug} />
      </div>
    </ScreenView>
  );
}
