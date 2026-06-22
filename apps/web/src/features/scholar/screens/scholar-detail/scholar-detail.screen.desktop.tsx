"use client";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { useScholarDetail, useScholarContent } from "@sd/domain-content";
import { ScholarHeader } from "@/features/scholar/components/scholar-header/scholar-header";
import { ScholarContentList } from "@/features/scholar/components/scholar-content-list/scholar-content-list";

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
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 48 }}>
        <div style={{ flex: "0 0 320px" }}>
          <ScholarHeader scholar={scholar} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {content && <ScholarContentList content={content} />}
        </div>
      </div>
    </ScreenView>
  );
}
