import { z } from "zod";
import { StatusValueSchema } from "./common.types";
import { LocaleSchema } from "./localization.types";

export const CollectionViewDtoSchema = z.object({
  id: z.string(),
  scholarId: z.string(),
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
export type CollectionViewDto = z.infer<typeof CollectionViewDtoSchema>;

export const AdminCollectionListItemDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: StatusValueSchema,
  publishedLectureCount: z.number(),
  orderIndex: z.number().optional(),
});
export type AdminCollectionListItemDto = z.infer<typeof AdminCollectionListItemDtoSchema>;

export const AdminCollectionDetailDtoSchema = z.object({
  id: z.string(),
  scholarId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  language: z.string().optional(),
  status: StatusValueSchema,
  orderIndex: z.number().optional(),
});
export type AdminCollectionDetailDto = z.infer<typeof AdminCollectionDetailDtoSchema>;
