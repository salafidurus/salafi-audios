import { useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import type { ScholarListItemDto } from "@sd/core-contracts";
import { useScholarsList } from "@sd/domain-content";
import { AppText } from "@/shared/components/AppText/AppText";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScholarCard } from "@/features/scholar/components/scholar-card/scholar-card";

export type ScholarListScreenProps = {
  onSelectScholar?: (slug: string) => void;
};

export function ScholarListScreen({ onSelectScholar }: ScholarListScreenProps) {
  const { data, isFetching } = useScholarsList();
  const scholars = data?.scholars ?? [];

  const renderItem = useCallback(
    ({ item }: { item: ScholarListItemDto }) => (
      <View style={styles.scholarColumn}>
        <ScholarCard scholar={item} onPress={onSelectScholar} />
      </View>
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
      <View style={styles.container}>
        <Text style={styles.heading}>Scholars</Text>
        {scholars.length === 0 && !isFetching ? (
          <AppText variant="bodyMd">No scholars found.</AppText>
        ) : (
          <FlatList
            data={scholars}
            keyExtractor={(item: ScholarListItemDto) => item.id}
            numColumns={2}
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
            columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
            renderItem={renderItem}
          />
        )}
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  scholarColumn: {
    flex: 1,
  },
});
