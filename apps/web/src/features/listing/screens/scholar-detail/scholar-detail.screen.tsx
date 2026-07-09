"use client";

import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { useScholarDetail } from "@sd/domain-content";
import { ScholarHeader } from "@/features/listing/components/scholar/scholar-header/scholar-header";
import { ScholarContentList } from "@/features/listing/components/scholar/scholar-content-list/scholar-content-list";
import styles from "./scholar-detail.screen.module.css";

export type ScholarDetailScreenProps = {
  slug: string;
};

export function ScholarDetailScreen({ slug }: ScholarDetailScreenProps) {
  const isDesktop = useIsDesktop();
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

  if (isDesktop) {
    return (
      <ScreenView>
        <div className={styles.layout}>
          <div className={styles.sidebar}>
            <ScholarHeader scholar={scholar} />
          </div>
          <div className={styles.main}>
            <ScholarContentList slug={slug} />
          </div>
        </div>
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
