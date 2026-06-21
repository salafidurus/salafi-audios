import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useLectureProgress } from "@sd/domain-audio";

type ResumeBadgeProps = {
  lectureId: string;
};

export function ResumeBadge({ lectureId }: ResumeBadgeProps) {
  const { resumePositionSeconds, isCompleted, progressPercent } = useLectureProgress(lectureId);

  if (isCompleted) {
    return (
      <View style={[styles.badge, styles.completedBadge]}>
        <Text style={styles.completedLabel}>✓ Completed</Text>
      </View>
    );
  }

  if (resumePositionSeconds === 0 || progressPercent === 0) return null;

  return (
    <View style={[styles.badge, styles.resumeBadge]}>
      <Text style={styles.resumeLabel}>Resume at {formatTime(resumePositionSeconds)}</Text>
    </View>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create((theme) => ({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  completedBadge: {
    backgroundColor: theme.colors.state.successSurface,
  },
  completedLabel: {
    fontSize: 12,
    color: theme.colors.state.success,
    fontWeight: "600",
  },
  resumeBadge: {
    backgroundColor: theme.colors.surface.primarySubtle,
  },
  resumeLabel: {
    fontSize: 12,
    color: theme.colors.action.primary,
    fontWeight: "500",
  },
}));
