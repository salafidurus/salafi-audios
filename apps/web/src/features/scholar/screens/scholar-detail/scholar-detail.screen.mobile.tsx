"use client";

import { ScreenViewWeb } from "../../../../shared/components/ScreenView/ScreenView";
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
      <ScreenViewWeb center>
        <AppText variant="bodyMd">Loading scholar...</AppText>
      </ScreenViewWeb>
    );
  }

  if (!scholar) {
    return (
      <ScreenViewWeb center>
        <AppText variant="titleMd">Scholar not found</AppText>
      </ScreenViewWeb>
    );
  }

  return (
    <ScreenViewWeb>
      <ScholarHeaderWeb scholar={scholar} />
      <div style={{ marginTop: 24 }}>{content && <ScholarContentListWeb content={content} />}</div>
    </ScreenViewWeb>
  );
}
