"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { useScholarDetail, useScholarContent } from "@sd/domain-content";
import { ScholarHeader } from "@/features/scholar/components/scholar-header/scholar-header";
import { ScholarContentList } from "@/features/scholar/components/scholar-content-list/scholar-content-list";
import styles from "./scholar-detail.screen.desktop.module.css";

export type ScholarDetailDesktopScreenProps = {
  slug: string;
};

export function ScholarDetailDesktopScreen({ slug }: ScholarDetailDesktopScreenProps) {
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
      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <ScholarHeader scholar={scholar} />
        </div>
        <div className={styles.main}>
          <ScholarContentList items={content?.items ?? []} />
        </div>
      </div>
    </ScreenView>
  );
}
