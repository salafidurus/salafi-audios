import type { ListingDetailDto } from "@sd/core-contracts";

import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";
import { UserAvatar } from "@/shared/components/user-avatar/user-avatar";

export type LectureMetaProps = {
  lecture: ListingDetailDto;
};

function formatDuration(durationSeconds?: number): string | null {
  if (!durationSeconds) {
    return null;
  }

  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.round((durationSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function formatPublishedAt(publishedAt?: string): string | null {
  if (!publishedAt) {
    return null;
  }

  const parsed = new Date(publishedAt);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function LectureMeta({ lecture }: LectureMetaProps) {
  const metaDetails = [
    lecture.language ? lecture.language.toUpperCase() : null,
    formatDuration(lecture.durationSeconds),
    formatPublishedAt(lecture.publishedAt),
  ].filter(Boolean);

  return (
    <View style={styles.container}>
      <UserAvatar image={lecture.scholar.imageUrl} name={lecture.scholar.name} size={40} />
      <View style={styles.info}>
        <AppText variant="titleMd">{lecture.scholar.name}</AppText>
        {metaDetails.length > 0 && (
          <AppText variant="xs" style={styles.metaText}>
            {metaDetails.join(" • ")}
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.md,
    marginVertical: theme.spacing.scale.sm,
  },
  info: {
    gap: theme.spacing.scale.xs,
  },
  metaText: {
    color: theme.colors.content.muted,
  },
}));
