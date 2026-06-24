"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { useScholarDetail, useScholarContent } from "@sd/domain-content";
import { ScholarHeader } from "@/features/scholar/components/scholar-header/scholar-header";
import { ScholarContentList } from "@/features/scholar/components/scholar-content-list/scholar-content-list";
import styles from "./scholar-detail.screen.mobile.module.css";

export type ScholarDetailMobileScreenProps = {
  slug: string;
};

export function ScholarDetailMobileScreen({ slug }: ScholarDetailMobileScreenProps) {
  const { data: scholar, isFetching: isScholarFetching } = useScholarDetail(slug);
  const { data: content, isFetching: isContentFetching } = useScholarContent(slug);
  const isFetching = isScholarFetching || isContentFetching;

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
        <ScholarContentList items={content?.items ?? []} />
      </div>
    </ScreenView>
  );
}
