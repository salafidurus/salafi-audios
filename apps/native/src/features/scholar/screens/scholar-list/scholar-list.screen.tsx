import { useCallback } from "react";
import { FlatList } from "react-native";
import type { ScholarListItemDto } from "@sd/core-contracts";
import { useScholarsList } from "@sd/domain-content";
import { AppText } from "@/shared/components/AppText/AppText";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScholarRow } from "@/features/scholar/components/scholar-row/scholar-row";

export type ScholarListScreenProps = {
  onSelectScholar?: (slug: string) => void;
};

export function ScholarListScreen({ onSelectScholar }: ScholarListScreenProps) {
  const { data, isFetching } = useScholarsList();
  const scholars = data?.scholars ?? [];

  const renderItem = useCallback(
    ({ item }: { item: ScholarListItemDto }) => (
      <ScholarRow scholar={item} onPress={onSelectScholar} />
    ),
    [onSelectScholar],
  );

  if (isFetching && scholars.length === 0) {
    return (
      <ScreenView center>
        <AppText variant="bodyMd">Loading scholars…</AppText>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      {scholars.length === 0 && !isFetching ? (
        <AppText variant="bodyMd">No scholars found.</AppText>
      ) : (
        <FlatList
          data={scholars}
          keyExtractor={(item: ScholarListItemDto) => item.id}
          renderItem={renderItem}
        />
      )}
    </ScreenView>
  );
}
