import { z } from "zod";

export const LectureProgressDtoSchema = z.object({
  lectureId: z.string(),
  positionSeconds: z.number(),
  durationSeconds: z.number(),
  completedAt: z.string().optional(),
  updatedAt: z.string(),
});
export type LectureProgressDto = z.infer<typeof LectureProgressDtoSchema>;

export const ProgressUpdateDtoSchema = z.object({
  lectureId: z.string().min(1, "Lecture ID must not be empty"),
  positionSeconds: z.number().min(0, "Position must be non-negative"),
  durationSeconds: z.number().min(0, "Duration must be non-negative"),
});
export type ProgressUpdateDto = z.infer<typeof ProgressUpdateDtoSchema>;
