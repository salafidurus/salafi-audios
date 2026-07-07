import { httpClient, endpoints } from "@sd/core-contracts";
import type {
  LivestreamChannelDto,
  CreateLivestreamChannelDto,
  UpdateLivestreamChannelDto,
  LiveSessionPublicDto,
  CreateLiveSessionDto,
  UpdateLiveSessionDto,
  LiveSessionStatus,
} from "@sd/core-contracts";

export async function fetchAdminChannels(): Promise<LivestreamChannelDto[]> {
  return httpClient<LivestreamChannelDto[]>({
    url: endpoints.admin.live.listChannels,
    method: "GET",
  });
}

export async function createChannel(
  data: CreateLivestreamChannelDto,
): Promise<LivestreamChannelDto> {
  return httpClient<LivestreamChannelDto>({
    url: endpoints.admin.live.createChannel,
    method: "POST",
    body: data,
  });
}

export async function updateChannel(
  id: string,
  data: Partial<UpdateLivestreamChannelDto>,
): Promise<LivestreamChannelDto> {
  return httpClient<LivestreamChannelDto>({
    url: endpoints.admin.live.updateChannel(id),
    method: "PUT",
    body: data,
  });
}

export async function createSession(data: CreateLiveSessionDto): Promise<LiveSessionPublicDto> {
  return httpClient<LiveSessionPublicDto>({
    url: endpoints.admin.live.createSession,
    method: "POST",
    body: data,
  });
}

export async function updateSession(
  id: string,
  data: Partial<UpdateLiveSessionDto>,
): Promise<LiveSessionPublicDto> {
  return httpClient<LiveSessionPublicDto>({
    url: endpoints.admin.live.updateSession(id),
    method: "PUT",
    body: data,
  });
}

export async function updateSessionStatus(
  id: string,
  status: LiveSessionStatus,
): Promise<LiveSessionPublicDto> {
  return httpClient<LiveSessionPublicDto>({
    url: endpoints.admin.live.updateStatus(id),
    method: "PATCH",
    body: { status },
  });
}
