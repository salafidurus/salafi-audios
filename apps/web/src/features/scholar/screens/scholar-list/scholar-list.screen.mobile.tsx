"use client";

import { useScholarsList } from "@sd/domain-content";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AppText } from "@/shared/components/AppText/AppText";
import { ScholarCard } from "@/features/scholar/components/scholar-card/scholar-card";

export type ScholarListMobileScreenProps = {
  onSelectScholar?: (slug: string) => void;
};

export function ScholarListMobileScreen({ onSelectScholar }: ScholarListMobileScreenProps) {
  const { data, isFetching } = useScholarsList();
  const scholars = data?.scholars ?? [];

  if (isFetching && scholars.length === 0) {
    return (
      <ScreenView center>
        <AppText variant="bodyMd">Loading scholars…</AppText>
      </ScreenView>
    );
  }

  if (!isFetching && scholars.length === 0) {
    return (
      <ScreenView center>
        <AppText variant="bodyMd">No scholars found.</AppText>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <div style={{ padding: "16px 0" }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 16,
            color: "var(--content-strong)",
          }}
        >
          Scholars
        </h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 12,
          }}
        >
          {scholars.map((scholar) => (
            <ScholarCard key={scholar.id} scholar={scholar} onPress={onSelectScholar} />
          ))}
        </div>
      </div>
    </ScreenView>
  );
}
