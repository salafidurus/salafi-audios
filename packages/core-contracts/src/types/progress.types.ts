import { z } from "zod";

export const ListingProgressDtoSchema = z.object({
  listingId: z.string(),
  positionSeconds: z.number(),
  durationSeconds: z.number(),
  completedAt: z.string().optional(),
  updatedAt: z.string(),
});
export type ListingProgressDto = z.infer<typeof ListingProgressDtoSchema>;

export const ProgressUpdateDtoSchema = z.object({
  listingId: z.string().min(1, "Listing ID must not be empty"),
  positionSeconds: z.number().min(0, "Position must be non-negative"),
  durationSeconds: z.number().min(0, "Duration must be non-negative"),
});
export type ProgressUpdateDto = z.infer<typeof ProgressUpdateDtoSchema>;
