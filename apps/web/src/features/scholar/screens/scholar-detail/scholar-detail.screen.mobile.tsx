"use client";

import { ScreenView } from "../../../../shared/components/ScreenView/ScreenView";
import { AppText } from "../../../../shared/components/AppText/AppText";
import { useScholarDetailScreen } from "@sd/domain-content";
import { ScholarHeaderWeb } from "../../components/scholar-header/scholar-header";
import { ScholarContentListWeb } from "../../components/scholar-content-list/scholar-content-list";

export type ScholarDetailMobileWebScreenProps = {
  slug: string;
};

export function ScholarDetailMobileWebScreen({ slug }: ScholarDetailMobileWebScreenProps) {
  const { scholar, content, isFetching } = useScholarDetailScreen(slug);

  if (isFetching) {
    return (
      <ScreenView center>
        <AppText variant="bodyMd">Loading scholar...</AppText>
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
      <ScholarHeaderWeb scholar={scholar} />
      <div style={{ marginTop: 24 }}>{content && <ScholarContentListWeb content={content} />}</div>
    </ScreenView>
  );
}
