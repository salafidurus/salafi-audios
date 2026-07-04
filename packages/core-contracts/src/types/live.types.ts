export type LiveSessionStatus = "scheduled" | "live" | "ended";

import type { Locale } from "./localization.types";

export type LiveSessionPublicDto = {
  id: string;
  status: LiveSessionStatus;
  channelDisplayName: string;
  telegramSlug?: string;
  scholarName?: string;
  scholarSlug?: string;
  scholarImageUrl?: string;
  title?: string;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  updatedAt: string;
  recordingLectureId?: string;
};

export type LiveSessionDeltaDto = {
  sessions: LiveSessionPublicDto[];
  deletedIds: string[];
  fetchedAt: string;
};

// Keep backward compat — old types remain
export type LiveSessionDto = {
  id: string;
  title: string;
  description?: string;
  scholarId: string;
  scholarName: string;
  status: LiveSessionStatus;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  viewerCount?: number;
  streamUrl?: string;
  recordingLectureId?: string;
};

export type LiveSessionPageDto = {
  items: LiveSessionDto[];
  nextCursor?: string;
  hasMore: boolean;
};

// Livestream Channel Types
export type LivestreamChannelDto = {
  id: string;
  displayName: string;
  telegramSlug?: string;
  language?: Locale;
  isActive: boolean;
  scholarName?: string;
  scholarSlug?: string;
  scholarImageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateLivestreamChannelDto = {
  telegramId: string;
  telegramSlug?: string;
  displayName: string;
  language?: Locale;
  scholarId?: string;
};

export type UpdateLivestreamChannelDto = {
  telegramSlug?: string;
  displayName?: string;
  language?: Locale;
  isActive?: boolean;
  scholarId?: string;
};

export type CreateLiveSessionDto = {
  channelId: string;
  title?: string;
  scheduledAt?: string;
  telegramMsgId?: string;
};

export type UpdateLiveSessionDto = {
  title?: string;
  scheduledAt?: string;
  status?: LiveSessionStatus;
  telegramMsgId?: string;
  viewerCount?: number;
};
