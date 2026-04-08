import { Text, View } from "react-native";
import { useLectureProgress } from "@sd/domain-progress";

type ResumeBadgeNativeProps = {
  lectureId: string;
};

export function ResumeBadgeNative({ lectureId }: ResumeBadgeNativeProps) {
  const { resumePositionSeconds, isCompleted, progressPercent } = useLectureProgress(lectureId);

  if (isCompleted) {
    return (
      <View
        style={{
          paddingHorizontal: 6,
          paddingVertical: 2,
          backgroundColor: "#f0fdf4",
          borderRadius: 4,
        }}
      >
        <Text style={{ fontSize: 11, color: "#16a34a", fontWeight: "600" }}>✓ Completed</Text>
      </View>
    );
  }

  if (resumePositionSeconds === 0 || progressPercent === 0) return null;

  return (
    <View
      style={{
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: "#eff6ff",
        borderRadius: 4,
      }}
    >
      <Text style={{ fontSize: 11, color: "#2563eb", fontWeight: "500" }}>
        Resume at {formatTime(resumePositionSeconds)}
      </Text>
    </View>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
