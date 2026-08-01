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
  AdminArrangeDataDto,
  ArrangeCommitDto,
  ArrangeCommitResultDto,
  BatchPresignAudioRequestDto,
  BatchPresignAudioResponseDto,
} from "@sd/core-contracts";

import { httpClient, endpoints } from "@sd/core-contracts";

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

export function getBatchPresignedUrls(data: BatchPresignAudioRequestDto) {
  return httpClient<BatchPresignAudioResponseDto>({
    url: endpoints.admin.media.presignBatch,
    method: "POST",
    body: data,
  });
}

/** Upload via XMLHttpRequest — fetch cannot report upload progress. */
export function uploadToR2WithProgress(
  uploadUrl: string,
  file: Blob,
  contentType: string,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Failed to upload to storage (HTTP ${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Failed to upload to storage: network error"));
    xhr.onabort = () => reject(new Error("Upload aborted"));
    xhr.send(file);
  });
}

export function fetchArrangeData(id: string) {
  return httpClient<AdminArrangeDataDto>({
    url: endpoints.admin.listings.arrangeData(id),
    method: "GET",
  });
}

export class ArrangeConflictError extends Error {
  constructor(public readonly conflictingSlugs: string[]) {
    super("Some slugs are already in use");
    this.name = "ArrangeConflictError";
  }
}

export async function commitArrange(id: string, data: ArrangeCommitDto) {
  try {
    return await httpClient<ArrangeCommitResultDto>({
      url: endpoints.admin.listings.arrangeCommit(id),
      method: "POST",
      body: data,
    });
  } catch (err) {
    // httpClient flattens non-2xx bodies into the error message — recover the
    // structured conflictingSlugs payload from a 409 so the UI can highlight rows.
    const message = (err as Error)?.message ?? "";
    if (message.startsWith("API 409")) {
      const jsonStart = message.indexOf("{");
      if (jsonStart !== -1) {
        try {
          const body = JSON.parse(message.slice(jsonStart)) as { conflictingSlugs?: string[] };
          if (body.conflictingSlugs?.length) {
            throw new ArrangeConflictError(body.conflictingSlugs);
          }
        } catch (parseErr) {
          if (parseErr instanceof ArrangeConflictError) throw parseErr;
        }
      }
    }
    throw err;
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
