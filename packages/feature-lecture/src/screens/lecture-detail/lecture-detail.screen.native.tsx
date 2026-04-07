import { View, Text, TouchableOpacity } from "react-native";
import { useLectureDetailScreen } from "../../hooks/use-lecture-detail";

export type LectureDetailMobileNativeScreenProps = {
  id: string;
  onPlay?: (audioAssetId: string) => void;
};

export function LectureDetailMobileNativeScreen({
  id,
  onPlay,
}: LectureDetailMobileNativeScreenProps) {
  const { lecture, isFetching } = useLectureDetailScreen(id);

  if (isFetching) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading lecture...</Text>
      </View>
    );
  }

  if (!lecture) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Lecture not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>{lecture.title}</Text>
      {lecture.scholarId && (
        <Text style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
          Scholar: {lecture.scholarId}
        </Text>
      )}
      {lecture.description && (
        <Text style={{ fontSize: 14, marginTop: 12 }}>{lecture.description}</Text>
      )}
      {lecture.primaryAudioAsset && (
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity
            onPress={() => onPlay?.(lecture.primaryAudioAsset!.id)}
            style={{
              padding: 12,
              borderRadius: 8,
              backgroundColor: "#2563eb",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Play Lecture</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 12, color: "#888", marginTop: 6, textAlign: "center" }}>
            {lecture.primaryAudioAsset.durationSeconds
              ? `${Math.round(lecture.primaryAudioAsset.durationSeconds / 60)} min`
              : "Duration unknown"}
          </Text>
        </View>
      )}
    </View>
  );
}
