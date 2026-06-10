import { httpClient, endpoints } from "@sd/core-contracts";
import type {
  PresignedUrlRequestDto,
  PresignedUrlResponseDto,
  CreateLectureDto,
  LectureViewDto,
  AdminLectureUpdateDto,
  AdminLectureListDto,
  AdminLectureDetailDto,
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

export function createLecture(data: CreateLectureDto) {
  return httpClient<LectureViewDto>({
    url: endpoints.admin.lectures.create,
    method: "POST",
    body: data,
  });
}

export function updateLecture(id: string, data: AdminLectureUpdateDto) {
  return httpClient<LectureViewDto>({
    url: endpoints.admin.lectures.update(id),
    method: "PUT",
    body: data,
  });
}

export function publishLecture(id: string) {
  return httpClient<LectureViewDto>({
    url: endpoints.admin.lectures.publish(id),
    method: "POST",
  });
}

export function archiveLecture(id: string) {
  return httpClient<LectureViewDto>({
    url: endpoints.admin.lectures.archive(id),
    method: "POST",
  });
}

export function fetchAdminLectures(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.search) query.append("search", params.search);
  if (params?.status) query.append("status", params.status);

  const queryString = query.toString();
  const url = queryString
    ? `${endpoints.admin.lectures.list}?${queryString}`
    : endpoints.admin.lectures.list;

  return httpClient<AdminLectureListDto>({
    url,
    method: "GET",
  });
}

export function fetchAdminLectureDetail(id: string) {
  return httpClient<AdminLectureDetailDto>({
    url: endpoints.admin.lectures.detail(id),
    method: "GET",
  });
}
