export type LiveSessionStatus = "active" | "scheduled" | "ended";

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
