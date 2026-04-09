import type { LibraryItemDto } from "@sd/core-contracts";
import type { LectureProgress } from "@sd/domain-progress";

type SavedMap = Record<string, string>;

export function localProgressItems(progressMap: Record<string, LectureProgress>): LibraryItemDto[] {
  return Object.values(progressMap)
    .filter((p) => !p.completedAt && p.positionSeconds > 0)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((p) => ({
      id: p.lectureId,
      lectureId: p.lectureId,
      lectureTitle: p.lectureId,
      lectureSlug: p.lectureId,
      scholarId: "",
      scholarSlug: "",
      scholarName: "",
      durationSeconds: p.durationSeconds,
      progressSeconds: p.positionSeconds,
    }));
}

export function localSavedItems(savedMap: SavedMap): LibraryItemDto[] {
  return Object.entries(savedMap)
    .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
    .map(([lectureId, savedAt]) => ({
      id: lectureId,
      lectureId,
      lectureTitle: lectureId,
      lectureSlug: lectureId,
      scholarId: "",
      scholarSlug: "",
      scholarName: "",
      savedAt,
    }));
}

export function localCompletedItems(
  progressMap: Record<string, LectureProgress>,
): LibraryItemDto[] {
  return Object.values(progressMap)
    .filter((p): p is LectureProgress & { completedAt: string } => !!p.completedAt)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .map((p) => ({
      id: p.lectureId,
      lectureId: p.lectureId,
      lectureTitle: p.lectureId,
      lectureSlug: p.lectureId,
      scholarId: "",
      scholarSlug: "",
      scholarName: "",
      durationSeconds: p.durationSeconds,
      progressSeconds: p.positionSeconds,
      completedAt: p.completedAt,
    }));
}
