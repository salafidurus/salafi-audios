import { View, Text, Pressable, ScrollView } from "react-native";
import type { ScholarChipDto } from "@sd/core-contracts";

export type FeedScholarRowNativeProps = {
  scholars: ScholarChipDto[];
  onScholarPress?: (slug: string) => void;
};

export function FeedScholarRowNative({ scholars, onScholarPress }: FeedScholarRowNativeProps) {
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
      >
        {scholars.map((scholar) => (
          <Pressable
            key={scholar.id}
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
              }}
            />
            <Text
              numberOfLines={1}
              style={{
                fontSize: 11,
                color: "#555",
                textAlign: "center",
                maxWidth: 72,
              }}
            >
              {scholar.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
