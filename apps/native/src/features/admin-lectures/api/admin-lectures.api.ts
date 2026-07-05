import { httpClient, endpoints } from "@sd/core-contracts";
import type {
  PresignedUrlRequestDto,
  PresignedUrlResponseDto,
  CreateListingDto,
  AdminListingListDto,
  AdminListingDetailDto,
  AdminListingUpdateDto,
  BulkActionDto,
  BulkActionResultDto,
} from "@sd/core-contracts";
import { File, UploadTask, UploadType, type UploadProgress } from "expo-file-system";

export async function getPresignedUrl(
  data: PresignedUrlRequestDto,
): Promise<PresignedUrlResponseDto> {
  return httpClient<PresignedUrlResponseDto>({
    url: endpoints.admin.media.presignedUrl,
    method: "POST",
    body: data,
  });
}

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

export async function createLecture(data: CreateListingDto): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.create,
    method: "POST",
    body: data,
  });
}

export async function fetchAdminLectures(params?: {
  scholarId?: string;
  status?: string;
  page?: number;
}): Promise<AdminListingListDto> {
  return httpClient<AdminListingListDto>({
    url: endpoints.admin.listings.list,
    method: "GET",
    params: {
      scholarId: params?.scholarId,
      status: params?.status,
      page: params?.page,
    },
  });
}

export async function fetchAdminLectureDetail(id: string): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.detail(id),
    method: "GET",
  });
}

export async function updateLecture(
  id: string,
  data: Partial<AdminListingUpdateDto>,
): Promise<AdminListingDetailDto> {
  return httpClient<AdminListingDetailDto>({
    url: endpoints.admin.listings.update(id),
    method: "PUT",
    body: data,
  });
}

export async function bulkLectureAction(data: BulkActionDto): Promise<BulkActionResultDto> {
  return httpClient<BulkActionResultDto>({
    url: endpoints.admin.listings.bulk,
    method: "POST",
    body: data,
  });
}
