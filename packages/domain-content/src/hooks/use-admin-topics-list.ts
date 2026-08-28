import {
  useApiQuery,
  endpoints,
  queryKeys,
  type TopicDetailDto,
  httpClient,
} from "@sd/core-contracts";

/** Provides topic data for catalog administration workflows. */
/** Reads the topic catalog for protected content-management surfaces. */
export function useAdminTopicsList(options?: Parameters<typeof useApiQuery<TopicDetailDto[]>>[2]) {
  return useApiQuery(
    queryKeys.admin.topics.all(),
    () =>
      httpClient<TopicDetailDto[]>({
        url: endpoints.admin.topics.list,
        method: "GET",
      }),
    options,
  );
}
