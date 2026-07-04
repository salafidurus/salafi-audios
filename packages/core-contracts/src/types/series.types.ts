import { z } from "zod";
import { StatusValueSchema } from "./common.types";

export const SeriesViewDtoSchema = z.object({
  id: z.string(),
  scholarId: z.string(),
  collectionId: z.string().optional(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  publishedLectureCount: z.number().optional(),
  publishedDurationSeconds: z.number().optional(),
  language: z.string().optional(),
  status: StatusValueSchema,
  orderIndex: z.number().optional(),
  deletedAt: z.string().optional(),
  deleteAfterAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type SeriesViewDto = z.infer<typeof SeriesViewDtoSchema>;

export const AdminSeriesListItemDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: StatusValueSchema,
  publishedLectureCount: z.number(),
  orderIndex: z.number().optional(),
});
export type AdminSeriesListItemDto = z.infer<typeof AdminSeriesListItemDtoSchema>;

export const AdminSeriesDetailDtoSchema = z.object({
  id: z.string(),
  scholarId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  language: z.string().optional(),
  status: StatusValueSchema,
  orderIndex: z.number().optional(),
});
export type AdminSeriesDetailDto = z.infer<typeof AdminSeriesDetailDtoSchema>;

export const CreateSeriesDtoSchema = z.object({
  scholarId: z.string().min(1, "Scholar ID must not be empty"),
  title: z.string().min(1, "Title must not be empty"),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  language: z.string().optional(),
  orderIndex: z.number().optional(),
});
export type CreateSeriesDto = z.infer<typeof CreateSeriesDtoSchema>;

export const UpdateSeriesDtoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  language: z.string().optional(),
  orderIndex: z.number().optional(),
});
export type UpdateSeriesDto = z.infer<typeof UpdateSeriesDtoSchema>;
