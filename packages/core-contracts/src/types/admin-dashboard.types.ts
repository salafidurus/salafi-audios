import { z } from "zod";

/** Administrator dashboard metrics, activity, and pending-work response contracts. */
/** Optional aggregate counts; omitted values represent unavailable metrics, not zero. */
export const AdminDashboardMetricSchema = z.object({
  scholars: z.number().int().nonnegative().optional(),
  listings: z.number().int().nonnegative().optional(),
  topics: z.number().int().nonnegative().optional(),
  users: z.number().int().nonnegative().optional(),
});

/** A dashboard activity entry linking an editorial event to its relevant workspace view. */
export const AdminDashboardActivitySchema = z.object({
  id: z.string(),
  type: z.enum(["listing", "scholar"]),
  title: z.string(),
  subtitle: z.string().optional(),
  status: z.string().optional(),
  occurredAt: z.string(),
  href: z.string(),
});

/** A draft or review item that still requires administrative editorial attention. */
export const AdminDashboardPendingWorkSchema = z.object({
  id: z.string(),
  title: z.string(),
  scholarName: z.string(),
  status: z.enum(["draft", "review"]),
  updatedAt: z.string(),
  href: z.string(),
});

/** Complete dashboard payload combining summary metrics with activity and pending work. */
export const AdminDashboardDtoSchema = z.object({
  metrics: AdminDashboardMetricSchema,
  activity: z.array(AdminDashboardActivitySchema),
  pendingWork: z.array(AdminDashboardPendingWorkSchema),
});

/** Validated response shape for the administrative dashboard overview. */
export type AdminDashboardDto = z.infer<typeof AdminDashboardDtoSchema>;
