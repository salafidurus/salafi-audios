"use client";

import { ScreenView } from "../../../../shared/components/ScreenView/ScreenView";
import { AppText } from "../../../../shared/components/AppText/AppText";
import { useScholarDetailScreen } from "@sd/domain-content";
import { ScholarHeaderWeb } from "../../components/scholar-header/scholar-header";
import { ScholarContentListWeb } from "../../components/scholar-content-list/scholar-content-list";

export type ScholarDetailDesktopWebScreenProps = {
  slug: string;
};

export function ScholarDetailDesktopWebScreen({ slug }: ScholarDetailDesktopWebScreenProps) {
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
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 48 }}>
        <div style={{ flex: "0 0 320px" }}>
          <ScholarHeaderWeb scholar={scholar} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {content && <ScholarContentListWeb content={content} />}
        </div>
      </div>
    </ScreenView>
  );
}
