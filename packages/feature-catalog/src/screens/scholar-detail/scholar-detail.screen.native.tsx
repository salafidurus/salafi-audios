import { View, Text, Image } from "react-native";
import { useScholarDetailScreen } from "../../hooks/use-scholar-detail";

export type ScholarDetailMobileNativeScreenProps = {
  slug: string;
  onNavigateToCollection?: (id: string) => void;
  onNavigateToSeries?: (id: string) => void;
};

export function ScholarDetailMobileNativeScreen({
  slug,
  onNavigateToCollection,
  onNavigateToSeries,
}: ScholarDetailMobileNativeScreenProps) {
  const { scholar, stats, isFetching } = useScholarDetailScreen(slug);

  if (isFetching) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading scholar...</Text>
      </View>
    );
  }

  if (!scholar) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Scholar not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        {scholar.imageUrl && (
          <Image
            source={{ uri: scholar.imageUrl }}
            style={{ width: 80, height: 80, borderRadius: 40 }}
          />
        )}
        <Text style={{ fontSize: 22, fontWeight: "bold", marginTop: 8 }}>{scholar.name}</Text>
        {scholar.bio && (
          <Text style={{ color: "#666", fontSize: 14, marginTop: 4 }}>{scholar.bio}</Text>
        )}
        {stats && (
          <Text style={{ color: "#888", fontSize: 13, marginTop: 8 }}>
            {stats.seriesCount} series · {stats.lecturesCount} lectures
          </Text>
        )}
      </View>
    </View>
  );
}
