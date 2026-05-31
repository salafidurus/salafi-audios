"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { useScholarDetailScreen } from "@sd/domain-content";
import { ScholarHeader } from "@/features/scholar/components/scholar-header/scholar-header";
import { ScholarContentList } from "@/features/scholar/components/scholar-content-list/scholar-content-list";

export type ScholarDetailMobileScreenProps = {
  slug: string;
};

export function ScholarDetailMobileScreen({ slug }: ScholarDetailMobileScreenProps) {
  const { scholar, content, isFetching } = useScholarDetailScreen(slug);

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
      <div style={{ marginTop: 24 }}>{content && <ScholarContentList content={content} />}</div>
    </ScreenView>
  );
}
