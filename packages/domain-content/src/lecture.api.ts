import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type LectureDetailDto,
} from "@sd/core-contracts";

export function useLectureDetail(id: string) {
  return useApiQuery(
    queryKeys.lectures.detail(id, id),
    () =>
      httpClient<LectureDetailDto>({
        url: endpoints.lectures.detail(id),
        method: "GET",
      }),
    { enabled: !!id },
  );
}
