export type LiveSessionStatus = "scheduled" | "live" | "ended";

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
};

export type LiveSessionPageDto = {
  items: LiveSessionDto[];
  nextCursor?: string;
  hasMore: boolean;
};
