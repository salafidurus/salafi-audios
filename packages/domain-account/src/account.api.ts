import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type UserProfileDto,
  type UpdateProfileDto,
} from "@sd/core-contracts";

export function useAccountProfile() {
  return useApiQuery(queryKeys.account.profile(), () =>
    httpClient<UserProfileDto>({
      url: endpoints.account.profile,
      method: "GET",
    }),
  );
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileDto) =>
      httpClient<UserProfileDto>({
        url: endpoints.account.profile,
        method: "PATCH",
        body: data,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.account.profile(), updated);
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      httpClient<void>({
        url: endpoints.account.deleteAccount,
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.account.all });
    },
  });
}
