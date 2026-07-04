import { z } from "zod";
import { StatusValueSchema } from "./common.types";

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

export const CreateCollectionDtoSchema = z.object({
  scholarId: z.string().min(1, "Scholar ID must not be empty"),
  title: z.string().min(1, "Title must not be empty"),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  language: z.string().optional(),
  orderIndex: z.number().optional(),
});
export type CreateCollectionDto = z.infer<typeof CreateCollectionDtoSchema>;

export const UpdateCollectionDtoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  language: z.string().optional(),
  orderIndex: z.number().optional(),
});
export type UpdateCollectionDto = z.infer<typeof UpdateCollectionDtoSchema>;
