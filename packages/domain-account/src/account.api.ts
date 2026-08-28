import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type UserProfileDto,
  type UpdateProfileDto,
} from "@sd/core-contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** Client hooks for authenticated account profile reads and mutations. */
/** Reads the current user's account profile and derived ability rules. */
export function useAccountProfile(options?: { enabled?: boolean }) {
  return useApiQuery(
    queryKeys.account.profile(),
    () =>
      httpClient<UserProfileDto>({
        url: endpoints.account.profile,
        method: "GET",
      }),
    options,
  );
}

/** Updates the authenticated user's profile and refreshes the cached profile. */
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

/** Permanently requests deletion of the authenticated user's account. */
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
