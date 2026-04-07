export type LectureProgressDto = {
  lectureId: string;
  positionSeconds: number;
  durationSeconds: number;
  completedAt?: string;
  updatedAt: string;
};

export type ProgressUpdateDto = {
  lectureId: string;
  positionSeconds: number;
  durationSeconds: number;
};
