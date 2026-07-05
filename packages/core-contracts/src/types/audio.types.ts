import { z } from "zod";

export const StreamResponseDtoSchema = z.object({
  url: z.string(),
  durationSeconds: z.number(),
  format: z.string().nullable().optional(),
});
export type StreamResponseDto = z.infer<typeof StreamResponseDtoSchema>;

export const AudioProgressDtoSchema = z.object({
  lectureId: z.string(),
  positionSeconds: z.number(),
  durationSeconds: z.number(),
  completedAt: z.string().optional(),
  updatedAt: z.string(),
});
export type AudioProgressDto = z.infer<typeof AudioProgressDtoSchema>;

export const ProgressSyncItemDtoSchema = z.object({
  lectureId: z.string(),
  positionSeconds: z.number(),
  durationSeconds: z.number(),
  completedAt: z.string().optional(),
  updatedAt: z.string(),
});
export type ProgressSyncItemDto = z.infer<typeof ProgressSyncItemDtoSchema>;

export const ProgressSyncDtoSchema = z.object({
  items: z.array(ProgressSyncItemDtoSchema),
});
export type ProgressSyncDto = z.infer<typeof ProgressSyncDtoSchema>;
