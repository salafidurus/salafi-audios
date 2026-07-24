import { useApiQuery, endpoints, queryKeys, type TopicDetailDto } from "@sd/core-contracts";
import { httpClient } from "@sd/core-contracts";

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
