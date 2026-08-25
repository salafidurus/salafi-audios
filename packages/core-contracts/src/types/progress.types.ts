import { z } from "zod";

export const ListingProgressDtoSchema = z.object({
  listingId: z.string(),
  listingSlug: z.string().optional(),
  positionSeconds: z.number(),
  durationSeconds: z.number(),
  completedAt: z.string().optional(),
  updatedAt: z.string(),
});
export type ListingProgressDto = z.infer<typeof ListingProgressDtoSchema>;

export const ProgressUpdateDtoSchema = z
  .object({
    listingId: z.string().min(1, "Listing ID must not be empty").optional(),
    listingSlug: z.string().min(1, "Listing slug must not be empty").optional(),
    positionSeconds: z.number().min(0, "Position must be non-negative"),
    durationSeconds: z.number().min(0, "Duration must be non-negative"),
  })
  .refine((item) => item.listingId || item.listingSlug, {
    message: "Either listingSlug or legacy listingId is required",
    path: ["listingSlug"],
  });
export type ProgressUpdateDto = z.infer<typeof ProgressUpdateDtoSchema>;
