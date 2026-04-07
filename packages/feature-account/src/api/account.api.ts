import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type UserProfileDto,
} from "@sd/core-contracts";

export function useAccountProfile() {
  return useApiQuery(queryKeys.account.profile(), () =>
    httpClient<UserProfileDto>({
      url: endpoints.account.profile,
      method: "GET",
    }),
  );
}
