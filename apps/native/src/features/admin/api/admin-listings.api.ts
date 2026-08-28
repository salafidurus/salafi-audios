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

/** Describes the getPresignedUrl native contract and behavior. */
/** Describes the getPresignedUrl native function contract and behavior. */
export async function getPresignedUrl(
  data: PresignedUrlRequestDto,
): Promise<PresignedUrlResponseDto> {
  return httpClient<PresignedUrlResponseDto>({
    url: endpoints.admin.media.presignedUrl,
    method: "POST",
    body: data,
  });
}

/** Describes the uploadToR2 native contract and behavior. */
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

/** Describes the updateListing native contract and behavior. */
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

/** Describes the createListing native contract and behavior. */
export async function createListing(data: CreateListingDto): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.create,
    method: "POST",
    body: data,
  });
}

/** Describes the fetchAdminListingDetail native contract and behavior. */
export async function fetchAdminListingDetail(id: string): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.detail(id),
    method: "GET",
  });
}

/** Describes the bulkListingAction native contract and behavior. */
export async function bulkListingAction(data: BulkActionDto): Promise<BulkActionResultDto> {
  return httpClient<BulkActionResultDto>({
    url: endpoints.admin.listings.bulk,
    method: "POST",
    body: data,
  });
}
