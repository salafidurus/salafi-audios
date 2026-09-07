import { z } from "zod";

/** Defines the runtime schema for the authenticated user's follow state response. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- The preceding contract comment documents the schema boundary.
export const ScholarFollowDtoSchema = z.strictObject({
  scholarSlug: z.string().min(1),
  following: z.boolean(),
});

/** Public scholar-follow state returned by the API and consumed by clients. */
export type ScholarFollowDto = z.infer<typeof ScholarFollowDtoSchema>;
