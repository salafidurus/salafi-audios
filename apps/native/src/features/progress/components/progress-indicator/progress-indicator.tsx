import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useLectureProgress } from "@sd/domain-audio";

type ProgressIndicatorProps = {
  lectureId: string;
  size?: number;
};

export function ProgressIndicator({ lectureId, size = 32 }: ProgressIndicatorProps) {
  const { progressPercent, isCompleted } = useLectureProgress(lectureId);

  if (progressPercent === 0 && !isCompleted) return null;

  // Simple bar-style indicator for native (SVG requires react-native-svg)
  return (
    <View style={[styles.track, { width: size }]}>
      <View
        style={[
          styles.fill,
          isCompleted ? styles.fillCompleted : styles.fillInProgress,
          { width: `${Math.min(progressPercent, 100)}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  track: {
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.surface.subtle,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
  },
  fillCompleted: {
    backgroundColor: theme.colors.state.success,
  },
  fillInProgress: {
    backgroundColor: theme.colors.action.primary,
  },
}));
