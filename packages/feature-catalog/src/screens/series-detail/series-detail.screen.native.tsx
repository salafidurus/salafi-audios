import { View, Text, Image } from "react-native";
import { useSeriesDetailScreen } from "../../hooks/use-series-detail";

export type SeriesDetailMobileNativeScreenProps = {
  id: string;
  onNavigateToLecture?: (id: string) => void;
};

export function SeriesDetailMobileNativeScreen({
  id,
  onNavigateToLecture,
}: SeriesDetailMobileNativeScreenProps) {
  const { series, isFetching } = useSeriesDetailScreen(id);

  if (isFetching) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading series...</Text>
      </View>
    );
  }

  if (!series) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Series not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {series.coverImageUrl && (
        <Image
          source={{ uri: series.coverImageUrl }}
          style={{ width: "100%", height: 200, borderRadius: 8 }}
          resizeMode="cover"
        />
      )}
      <Text style={{ fontSize: 22, fontWeight: "bold", marginTop: 12 }}>{series.title}</Text>
      {series.description && (
        <Text style={{ color: "#666", fontSize: 14, marginTop: 4 }}>{series.description}</Text>
      )}
      <Text style={{ color: "#888", fontSize: 13, marginTop: 6 }}>
        {series.publishedLectureCount} lectures
      </Text>
    </View>
  );
}
