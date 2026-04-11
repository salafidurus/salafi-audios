import { Image, Pressable, Text, View } from "react-native";
import type { ScholarListItemDto } from "@sd/core-contracts";

export type ScholarCardProps = {
  scholar: ScholarListItemDto;
  onPress?: (slug: string) => void;
};

export function ScholarCard({ scholar, onPress }: ScholarCardProps) {
  return (
    <Pressable
      onPress={() => onPress?.(scholar.slug)}
      style={{
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
        gap: 6,
        backgroundColor: "#fff",
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          overflow: "hidden",
          backgroundColor: "#f3f4f6",
        }}
      >
        {scholar.imageUrl && (
          <Image source={{ uri: scholar.imageUrl }} style={{ width: 64, height: 64 }} />
        )}
      </View>
      <Text style={{ fontWeight: "600", fontSize: 13, textAlign: "center" }} numberOfLines={2}>
        {scholar.name}
      </Text>
      {scholar.mainLanguage && (
        <Text style={{ fontSize: 11, color: "#6b7280" }}>{scholar.mainLanguage}</Text>
      )}
      <Text style={{ fontSize: 11, color: "#9ca3af" }}>{scholar.lectureCount} lectures</Text>
    </Pressable>
  );
}
