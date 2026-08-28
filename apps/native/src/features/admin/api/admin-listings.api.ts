import type {
  PresignedUrlRequestDto,
  PresignedUrlResponseDto,
  CreateListingDto,
  AdminListingDetailDto,
  BulkActionDto,
  BulkActionResultDto,
  UpdateListingDetailsDto,
} from "@sd/core-contracts";

import { httpClient, endpoints } from "@sd/core-contracts";
import { File, UploadTask, UploadType, type UploadProgress } from "expo-file-system";

/** Requests the signed upload target used to transfer admin audio to object storage. */
/** Returns the the presigned url used by native consumers. */
export async function getPresignedUrl(
  data: PresignedUrlRequestDto,
): Promise<PresignedUrlResponseDto> {
  return httpClient<PresignedUrlResponseDto>({
    url: endpoints.admin.media.presignedUrl,
    method: "POST",
    body: data,
  });
}

/** Uploads admin audio to the signed object-storage target and reports transfer completion. */
export async function uploadToR2(
  uploadUrl: string,
  fileUri: string,
  contentType: string,
  onProgress?: (progress: number) => void,
): Promise<void> {
  const callback = onProgress
    ? ({ bytesSent, totalBytes }: UploadProgress) => {
        if (totalBytes > 0) {
          onProgress(bytesSent / totalBytes);
        }
      }
    : undefined;

  const file = new File(fileUri);
  const uploadTask = new UploadTask(file, uploadUrl, {
    httpMethod: "PUT",
    headers: { "Content-Type": contentType },
    uploadType: UploadType.BINARY_CONTENT,
    onProgress: callback,
  });

  const result = await uploadTask.uploadAsync();
  if (!result || result.status >= 300) {
    throw new Error(`R2 upload failed: ${result?.status}`);
  }
}

/** Sends an authoritative listing update through the admin API boundary. */
export async function updateListing(
  id: string,
  data: UpdateListingDetailsDto,
): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: `${endpoints.admin.listings.detail}/${id}/details`,
    method: "PUT",
    body: data,
  });
}

/** Creates a listing through the admin API boundary and returns its server identity. */
export async function createListing(data: CreateListingDto): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.create,
    method: "POST",
    body: data,
  });
}

/** Loads the authoritative admin listing detail used by the edit workflow. */
export async function fetchAdminListingDetail(id: string): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.detail(id),
    method: "GET",
  });
}

/** Applies one server-authoritative action to the selected listings. */
export async function bulkListingAction(data: BulkActionDto): Promise<BulkActionResultDto> {
  return httpClient<BulkActionResultDto>({
    url: endpoints.admin.listings.bulk,
    method: "POST",
    body: data,
  });
}
