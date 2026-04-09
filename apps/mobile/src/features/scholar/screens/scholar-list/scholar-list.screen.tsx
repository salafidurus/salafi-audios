import { View, Text, FlatList } from "react-native";
import { ScreenViewMobileNative } from "../../../../shared/components/ScreenView/ScreenView";
import { AppText } from "../../../../shared/components/AppText/AppText";
import { useScholarsList } from "@sd/domain-content";
import { ScholarCardNative } from "../../components/scholar-card/scholar-card";
import type { ScholarListItemDto } from "@sd/core-contracts";

export type ScholarListMobileNativeScreenProps = {
  onSelectScholar?: (slug: string) => void;
};

export function ScholarListMobileNativeScreen({
  onSelectScholar,
}: ScholarListMobileNativeScreenProps) {
  const { data, isFetching } = useScholarsList();
  const scholars = data?.scholars ?? [];

  if (isFetching && scholars.length === 0) {
    return (
      <ScreenViewMobileNative center>
        <AppText variant="bodyMd">Loading scholars...</AppText>
      </ScreenViewMobileNative>
    );
  }

  return (
    <ScreenViewMobileNative>
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
                <ScholarCardNative scholar={item} onPress={onSelectScholar} />
              </View>
            )}
          />
        )}
      </View>
    </ScreenViewMobileNative>
  );
}
