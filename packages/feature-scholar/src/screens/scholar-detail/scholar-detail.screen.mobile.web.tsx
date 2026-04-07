"use client";

import { ScreenViewWeb, AppText } from "@sd/shared";
import { useScholarDetailScreen } from "../../hooks/use-scholar-detail";
import { ScholarHeaderWeb } from "../../components/scholar-header/scholar-header.web";
import { ScholarContentListWeb } from "../../components/scholar-content-list/scholar-content-list.web";

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
