import { httpClient, endpoints } from "@sd/core-contracts";
import type {
  PresignedUrlRequestDto,
  PresignedUrlResponseDto,
  CreateListingDto,
  UpdateListingDetailsDto,
  AdminListingMediaDetailDto,
  UpdateListingMediaDto,
  AdminListingListDto,
  AdminListingDetailDto,
  ListingFormDataDto,
} from "@sd/core-contracts";

export function getPresignedUrl(data: PresignedUrlRequestDto) {
  return httpClient<PresignedUrlResponseDto>({
    url: endpoints.admin.media.presignedUrl,
    method: "POST",
    body: data,
  });
}

export async function uploadToR2(
  uploadUrl: string,
  file: Blob,
  contentType: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": contentType,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to upload to storage: ${response.statusText}`);
  }
}

export function createLecture(data: CreateListingDto) {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.create,
    method: "POST",
    body: data,
  });
}

export function updateListingDetails(id: string, data: UpdateListingDetailsDto) {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.updateDetails(id),
    method: "PUT",
    body: data,
  });
}

export function updateListingMedia(id: string, data: UpdateListingMediaDto) {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.updateMedia(id),
    method: "PUT",
    body: data,
  });
}

export function fetchListingMediaData(id: string) {
  return httpClient<AdminListingMediaDetailDto>({
    url: endpoints.admin.listings.mediaData(id),
    method: "GET",
  });
}

export function publishLecture(id: string) {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.publish(id),
    method: "POST",
  });
}

export function archiveLecture(id: string) {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.archive(id),
    method: "POST",
  });
}

export function fetchAdminLectures(params?: {
  cursor?: string;
  search?: string;
  status?: string;
  scholarId?: string;
}) {
  const query = new URLSearchParams();
  if (params?.cursor) {
    query.append("cursor", params.cursor);
  }
  if (params?.search) {
    query.append("search", params.search);
  }
  if (params?.status) {
    query.append("status", params.status);
  }
  if (params?.scholarId) {
    query.append("scholarId", params.scholarId);
  }
  const queryString = query.toString();
  const url = queryString
    ? `${endpoints.admin.listings.list}?${queryString}`
    : endpoints.admin.listings.list;

  return httpClient<AdminListingListDto>({
    url,
    method: "GET",
  });
}

export function fetchAdminLectureDetail(id: string) {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.detail(id),
    method: "GET",
  });
}

export function fetchListingFormData(id: string) {
  return httpClient<ListingFormDataDto>({
    url: endpoints.admin.listings.formData(id),
    method: "GET",
  });
}
