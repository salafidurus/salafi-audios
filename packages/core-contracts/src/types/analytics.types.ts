import { z } from "zod";

export const PlatformStatsDtoSchema = z.object({
  totalScholars: z.number(),
  totalLectures: z.number(),
  lecturesPublishedLast30Days: z.number(),
  seriesCount: z.number(),
  collectionCount: z.number(),
  totalPlayCount: z.number(),
  totalUniqueListeners: z.number(),
  updatedAt: z.string(),
});
export type PlatformStatsDto = z.infer<typeof PlatformStatsDtoSchema>;
