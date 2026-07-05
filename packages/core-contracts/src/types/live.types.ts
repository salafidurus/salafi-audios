import { z } from "zod";
import { LocaleSchema } from "./localization.types";

export const LiveSessionStatusSchema = z.enum(["scheduled", "live", "ended"]);
export type LiveSessionStatus = z.infer<typeof LiveSessionStatusSchema>;

export const LiveSessionPublicDtoSchema = z.object({
  id: z.string(),
  status: LiveSessionStatusSchema,
  channelDisplayName: z.string(),
  telegramSlug: z.string().optional(),
  scholarName: z.string().optional(),
  scholarSlug: z.string().optional(),
  scholarImageUrl: z.string().optional(),
  title: z.string().optional(),
  scheduledAt: z.string().optional(),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  updatedAt: z.string(),
  recordingLectureId: z.string().optional(),
});
export type LiveSessionPublicDto = z.infer<typeof LiveSessionPublicDtoSchema>;

export const LiveSessionDeltaDtoSchema = z.object({
  sessions: z.array(LiveSessionPublicDtoSchema),
  deletedIds: z.array(z.string()),
  fetchedAt: z.string(),
});
export type LiveSessionDeltaDto = z.infer<typeof LiveSessionDeltaDtoSchema>;

// Keep backward compat — old types remain
export const LiveSessionDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  scholarId: z.string(),
  scholarName: z.string(),
  status: LiveSessionStatusSchema,
  scheduledAt: z.string().optional(),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  viewerCount: z.number().optional(),
  streamUrl: z.string().optional(),
  recordingLectureId: z.string().optional(),
});
export type LiveSessionDto = z.infer<typeof LiveSessionDtoSchema>;

export const LiveSessionPageDtoSchema = z.object({
  items: z.array(LiveSessionDtoSchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});
export type LiveSessionPageDto = z.infer<typeof LiveSessionPageDtoSchema>;

// Livestream Channel Types
export const LivestreamChannelDtoSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  telegramSlug: z.string().optional(),
  language: LocaleSchema.optional(),
  isActive: z.boolean(),
  scholarName: z.string().optional(),
  scholarSlug: z.string().optional(),
  scholarImageUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type LivestreamChannelDto = z.infer<typeof LivestreamChannelDtoSchema>;

export const CreateLivestreamChannelDtoSchema = z.object({
  telegramId: z.string(),
  telegramSlug: z.string().optional(),
  displayName: z.string(),
  language: LocaleSchema.optional(),
  scholarId: z.string().optional(),
});
export type CreateLivestreamChannelDto = z.infer<typeof CreateLivestreamChannelDtoSchema>;

export const UpdateLivestreamChannelDtoSchema = z.object({
  telegramSlug: z.string().optional(),
  displayName: z.string().optional(),
  language: LocaleSchema.optional(),
  isActive: z.boolean().optional(),
  scholarId: z.string().optional(),
});
export type UpdateLivestreamChannelDto = z.infer<typeof UpdateLivestreamChannelDtoSchema>;

export const CreateLiveSessionDtoSchema = z.object({
  channelId: z.string(),
  title: z.string().optional(),
  scheduledAt: z.string().optional(),
  telegramMsgId: z.string().optional(),
});
export type CreateLiveSessionDto = z.infer<typeof CreateLiveSessionDtoSchema>;

export const UpdateLiveSessionDtoSchema = z.object({
  title: z.string().optional(),
  scheduledAt: z.string().optional(),
  status: LiveSessionStatusSchema.optional(),
  telegramMsgId: z.string().optional(),
  viewerCount: z.number().optional(),
});
export type UpdateLiveSessionDto = z.infer<typeof UpdateLiveSessionDtoSchema>;

export const UpdateLiveSessionStatusDtoSchema = z.object({
  status: LiveSessionStatusSchema,
});
export type UpdateLiveSessionStatusDto = z.infer<typeof UpdateLiveSessionStatusDtoSchema>;
