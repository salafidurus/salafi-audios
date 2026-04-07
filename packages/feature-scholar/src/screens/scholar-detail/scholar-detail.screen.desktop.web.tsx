"use client";

import { useScholarDetailScreen } from "../../hooks/use-scholar-detail";
import { ScholarHeaderWeb } from "../../components/scholar-header/scholar-header.web";
import { ScholarContentListWeb } from "../../components/scholar-content-list/scholar-content-list.web";

export type ScholarDetailDesktopWebScreenProps = {
  slug: string;
};

export function ScholarDetailDesktopWebScreen({ slug }: ScholarDetailDesktopWebScreenProps) {
  const { scholar, content, isFetching } = useScholarDetailScreen(slug);

  if (isFetching) {
    return <div style={{ padding: 32 }}>Loading scholar...</div>;
  }

  if (!scholar) {
    return <div style={{ padding: 32 }}>Scholar not found</div>;
  }

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 48 }}>
        <div style={{ flex: "0 0 320px" }}>
          <ScholarHeaderWeb scholar={scholar} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {content && <ScholarContentListWeb content={content} />}
        </div>
      </div>
    </div>
  );
}
