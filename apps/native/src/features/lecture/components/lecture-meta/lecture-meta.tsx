import type { LectureDetailDto } from "@sd/core-contracts";
import { View } from "react-native";
import { AppText } from "../../../../shared/components/AppText/AppText";

export type LectureMetaProps = {
  lecture: LectureDetailDto;
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
  const meta = [
    lecture.scholar.name,
    lecture.language ? lecture.language.toUpperCase() : null,
    formatDuration(lecture.durationSeconds),
    formatPublishedAt(lecture.publishedAt),
  ].filter(Boolean);

  return (
    <View style={{ marginTop: 10 }}>
      <AppText variant="bodySm" style={{ opacity: 0.7 }}>
        {meta.join(" • ")}
      </AppText>
    </View>
  );
}
