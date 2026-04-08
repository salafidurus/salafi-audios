import { View } from "react-native";
import { useLectureProgress } from "@sd/domain-progress";

type ProgressIndicatorNativeProps = {
  lectureId: string;
  size?: number;
};

export function ProgressIndicatorNative({ lectureId, size = 32 }: ProgressIndicatorNativeProps) {
  const { progressPercent, isCompleted } = useLectureProgress(lectureId);

  if (progressPercent === 0 && !isCompleted) return null;

  // Simple bar-style indicator for native (SVG requires react-native-svg)
  return (
    <View
      style={{
        width: size,
        height: 3,
        borderRadius: 2,
        backgroundColor: "#e5e7eb",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${Math.min(progressPercent, 100)}%`,
          backgroundColor: isCompleted ? "#16a34a" : "#2563eb",
          borderRadius: 2,
        }}
      />
    </View>
  );
}
