import { View, Text, FlatList } from "react-native";
import { ScreenView } from "../../../../shared/components/ScreenView/ScreenView";
import { AppText } from "../../../../shared/components/AppText/AppText";
import { useScholarsList } from "@sd/domain-content";
import { ScholarCard } from "../../components/scholar-card/scholar-card";
import type { ScholarListItemDto } from "@sd/core-contracts";

export type ScholarListScreenProps = {
  onSelectScholar?: (slug: string) => void;
};

export function ScholarListScreen({
  onSelectScholar,
}: ScholarListScreenProps) {
  const { data, isFetching } = useScholarsList();
  const scholars = data?.scholars ?? [];

  if (isFetching && scholars.length === 0) {
    return (
      <ScreenView center>
        <AppText variant="bodyMd">Loading scholars...</AppText>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16, paddingHorizontal: 16 }}>
          Scholars
        </Text>
        {scholars.length === 0 && !isFetching ? (
          <AppText variant="bodyMd">No scholars found.</AppText>
        ) : (
          <FlatList
            data={scholars}
            keyExtractor={(item: ScholarListItemDto) => item.id}
            numColumns={2}
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
            columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
            renderItem={({ item }: { item: ScholarListItemDto }) => (
              <View style={{ flex: 1 }}>
                <ScholarCard scholar={item} onPress={onSelectScholar} />
              </View>
            )}
          />
        )}
      </View>
    </ScreenView>
  );
}
