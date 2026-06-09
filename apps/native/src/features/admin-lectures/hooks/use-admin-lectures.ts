import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";
import type { AdminLectureListDto } from "@sd/core-contracts";

export function useAdminLectures(params?: { scholarId?: string; status?: string; page?: number }) {
  return useApiQuery<AdminLectureListDto>(["admin", "lectures", params], () =>
    httpClient<AdminLectureListDto>({
      url: endpoints.admin.lectures.list,
      method: "GET",
      params: {
        scholarId: params?.scholarId,
        status: params?.status,
        page: params?.page,
      },
    }),
  );
}
