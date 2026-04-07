"use client";

import { useScholarDetailScreen } from "../../hooks/use-scholar-detail";
import { ScholarHeaderWeb } from "../../components/scholar-header/scholar-header.web";
import { ScholarContentListWeb } from "../../components/scholar-content-list/scholar-content-list.web";

export type ScholarDetailMobileWebScreenProps = {
  slug: string;
};

export function ScholarDetailMobileWebScreen({ slug }: ScholarDetailMobileWebScreenProps) {
  const { scholar, content, isFetching } = useScholarDetailScreen(slug);

  if (isFetching) {
    return <div style={{ padding: 16 }}>Loading scholar...</div>;
  }

  if (!scholar) {
    return <div style={{ padding: 16 }}>Scholar not found</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <ScholarHeaderWeb scholar={scholar} />
      <div style={{ marginTop: 24 }}>{content && <ScholarContentListWeb content={content} />}</div>
    </div>
  );
}
