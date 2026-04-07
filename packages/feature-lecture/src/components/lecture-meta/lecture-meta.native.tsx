import { View, Text, Image } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import type { LectureDetailDto } from "@sd/core-contracts";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export type LectureMetaNativeProps = {
  lecture: LectureDetailDto;
};

export function LectureMetaNative({ lecture }: LectureMetaNativeProps) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      {/* Scholar chip */}
      <View style={[styles.scholarChip, { backgroundColor: theme.colors.surface.subtle }]}>
        {lecture.scholar.imageUrl && (
          <Image source={{ uri: lecture.scholar.imageUrl }} style={styles.scholarImage} />
        )}
        <Text style={[styles.scholarName, { color: theme.colors.content.default }]}>
          {lecture.scholar.name}
        </Text>
      </View>

      {/* Metadata row */}
      <View style={styles.metaRow}>
        {lecture.publishedAt && (
          <Text style={[styles.metaText, { color: theme.colors.content.muted }]}>
            {formatDate(lecture.publishedAt)}
          </Text>
        )}
        {lecture.durationSeconds != null && (
          <Text style={[styles.metaText, { color: theme.colors.content.muted }]}>
            {formatDuration(lecture.durationSeconds)}
          </Text>
        )}
        {lecture.language && (
          <Text style={[styles.metaText, { color: theme.colors.content.muted }]}>
            {lecture.language}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    marginTop: theme.spacing.component.gapMd,
    gap: theme.spacing.component.gapSm,
  },
  scholarChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: theme.spacing.component.gapSm,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: theme.spacing.component.chipX,
    borderRadius: theme.radius.component.chip,
  },
  scholarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  scholarName: {
    ...theme.typography.labelMd,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing.component.gapMd,
  },
  metaText: {
    ...theme.typography.bodySm,
  },
}));
