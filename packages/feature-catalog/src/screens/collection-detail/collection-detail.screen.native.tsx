import { View, Text, Image } from "react-native";
import { useCollectionDetailScreen } from "../../hooks/use-collection-detail";

export type CollectionDetailMobileNativeScreenProps = {
  id: string;
  onNavigateToSeries?: (id: string) => void;
};

export function CollectionDetailMobileNativeScreen({
  id,
  onNavigateToSeries,
}: CollectionDetailMobileNativeScreenProps) {
  const { collection, isFetching } = useCollectionDetailScreen(id);

  if (isFetching) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading collection...</Text>
      </View>
    );
  }

  if (!collection) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Collection not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {collection.coverImageUrl && (
        <Image
          source={{ uri: collection.coverImageUrl }}
          style={{ width: "100%", height: 200, borderRadius: 8 }}
          resizeMode="cover"
        />
      )}
      <Text style={{ fontSize: 22, fontWeight: "bold", marginTop: 12 }}>{collection.title}</Text>
      {collection.description && (
        <Text style={{ color: "#666", fontSize: 14, marginTop: 4 }}>{collection.description}</Text>
      )}
      <Text style={{ color: "#888", fontSize: 13, marginTop: 6 }}>
        {collection.publishedLectureCount} lectures
      </Text>
    </View>
  );
}
