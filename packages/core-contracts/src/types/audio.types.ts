import { z } from "zod";

/** Stream and listening-progress contracts exchanged by audio clients and the API. */
/** Defines the runtime contract value for stream response dto schema. */
export const StreamResponseDtoSchema = z.object({
  url: z.string(),
  durationSeconds: z.number(),
  format: z.string().nullable().optional(),
});
/** Defines the contract type for stream response dto. */
export type StreamResponseDto = z.infer<typeof StreamResponseDtoSchema>;

/** Defines the runtime contract value for audio progress dto schema. */
export const AudioProgressDtoSchema = z.object({
  listingSlug: z.string(),
  positionSeconds: z.number(),
  durationSeconds: z.number(),
  completedAt: z.string().optional(),
  updatedAt: z.string(),
});
/** Defines the contract type for audio progress dto. */
export type AudioProgressDto = z.infer<typeof AudioProgressDtoSchema>;

/** Defines the runtime contract value for progress sync item dto schema. */
export const ProgressSyncItemDtoSchema = z.object({
  listingSlug: z.string().min(1),
  positionSeconds: z.number(),
  durationSeconds: z.number(),
  completedAt: z.string().optional(),
  updatedAt: z.string(),
});
/** Defines the contract type for progress sync item dto. */
export type ProgressSyncItemDto = z.infer<typeof ProgressSyncItemDtoSchema>;

/** Defines the runtime contract value for progress sync dto schema. */
export const ProgressSyncDtoSchema = z.object({
  items: z.array(ProgressSyncItemDtoSchema),
});
/** Defines the contract type for progress sync dto. */
export type ProgressSyncDto = z.infer<typeof ProgressSyncDtoSchema>;
