"use client";

import { ScreenViewWeb, AppText } from "@sd/shared";
import { useScholarDetailScreen } from "../../hooks/use-scholar-detail";
import { ScholarHeaderWeb } from "../../components/scholar-header/scholar-header.web";
import { ScholarContentListWeb } from "../../components/scholar-content-list/scholar-content-list.web";

export type ScholarDetailDesktopWebScreenProps = {
  slug: string;
};

export function ScholarDetailDesktopWebScreen({ slug }: ScholarDetailDesktopWebScreenProps) {
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
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 48 }}>
        <div style={{ flex: "0 0 320px" }}>
          <ScholarHeaderWeb scholar={scholar} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {content && <ScholarContentListWeb content={content} />}
        </div>
      </div>
    </ScreenViewWeb>
  );
}
