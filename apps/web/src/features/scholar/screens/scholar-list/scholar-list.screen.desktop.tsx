"use client";

import { useScholarsList } from "@sd/domain-content";
import { ScreenViewWeb } from "../../../../shared/components/ScreenView/ScreenView";
import { AppText } from "../../../../shared/components/AppText/AppText";
import { ScholarCardWeb } from "../../components/scholar-card/scholar-card";

export type ScholarListDesktopWebScreenProps = {
  onSelectScholar?: (slug: string) => void;
};

export function ScholarListDesktopWebScreen({ onSelectScholar }: ScholarListDesktopWebScreenProps) {
  const { data, isFetching } = useScholarsList();
  const scholars = data?.scholars ?? [];

  if (isFetching && scholars.length === 0) {
    return (
      <ScreenViewWeb center>
        <AppText variant="bodyMd">Loading scholars...</AppText>
      </ScreenViewWeb>
    );
  }

  if (!isFetching && scholars.length === 0) {
    return (
      <ScreenViewWeb center>
        <AppText variant="bodyMd">No scholars found.</AppText>
      </ScreenViewWeb>
    );
  }

  return (
    <ScreenViewWeb>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 0" }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 24,
            color: "var(--content-strong)",
          }}
        >
          Scholars
        </h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          {scholars.map((scholar) => (
            <ScholarCardWeb key={scholar.id} scholar={scholar} onPress={onSelectScholar} />
          ))}
        </div>
      </div>
    </ScreenViewWeb>
  );
}
