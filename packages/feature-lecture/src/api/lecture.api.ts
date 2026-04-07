import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type LectureViewDto,
} from "@sd/core-contracts";

export function useLectureDetail(id: string) {
  return useApiQuery(
    queryKeys.lectures.detail(id, id),
    () =>
      httpClient<LectureViewDto>({
        url: endpoints.lectures.detail(id),
        method: "GET",
      }),
    { enabled: !!id },
  );
}
