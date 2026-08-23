import { z } from "zod";

export const AdminDashboardMetricSchema = z.object({
  scholars: z.number().int().nonnegative().optional(),
  listings: z.number().int().nonnegative().optional(),
  topics: z.number().int().nonnegative().optional(),
  users: z.number().int().nonnegative().optional(),
});

export const AdminDashboardActivitySchema = z.object({
  id: z.string(),
  type: z.enum(["listing", "scholar"]),
  title: z.string(),
  subtitle: z.string().optional(),
  status: z.string().optional(),
  occurredAt: z.string(),
  href: z.string(),
});

export const AdminDashboardPendingWorkSchema = z.object({
  id: z.string(),
  title: z.string(),
  scholarName: z.string(),
  status: z.enum(["draft", "review"]),
  updatedAt: z.string(),
  href: z.string(),
});

export const AdminDashboardDtoSchema = z.object({
  metrics: AdminDashboardMetricSchema,
  activity: z.array(AdminDashboardActivitySchema),
  pendingWork: z.array(AdminDashboardPendingWorkSchema),
});

export type AdminDashboardDto = z.infer<typeof AdminDashboardDtoSchema>;
