import { View, Text, Pressable, FlatList } from "react-native";
import type { ListRenderItemInfo } from "react-native";
import { Image } from "expo-image";
import type { ScholarChipDto } from "@sd/core-contracts";

export type FeedScholarRowProps = {
  scholars: ScholarChipDto[];
  onScholarPress?: (slug: string) => void;
};

export function FeedScholarRow({ scholars, onScholarPress }: FeedScholarRowProps) {
  function renderScholar({ item: scholar }: ListRenderItemInfo<ScholarChipDto>) {
    return (
      <Pressable
        onPress={() => onScholarPress?.(scholar.slug)}
        style={{ alignItems: "center", width: 72 }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#e0e0e0",
            marginBottom: 4,
            overflow: "hidden",
          }}
        >
          {scholar.imageUrl && (
            <Image
              source={{ uri: scholar.imageUrl }}
              style={{ width: 48, height: 48 }}
              contentFit="cover"
            />
          )}
        </View>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 12,
            color: "#555",
            textAlign: "center",
            maxWidth: 72,
          }}
        >
          {scholar.name}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={{ paddingVertical: 12 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: "#333",
          marginBottom: 8,
          paddingLeft: 4,
        }}
      >
        Popular Scholars
      </Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
        data={scholars}
        keyExtractor={(item) => item.id}
        renderItem={renderScholar}
      />
    </View>
  );
}
