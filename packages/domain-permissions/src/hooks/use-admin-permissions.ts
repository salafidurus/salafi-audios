import {
  useApiQuery,
  queryKeys,
  httpClient,
  endpoints,
  type AdminPermission,
  type UserRole,
} from "@sd/core-contracts";
import type { UseQueryOptions, QueryKey } from "@tanstack/react-query";

type MyPermissionsDto = { permissions: AdminPermission[]; roles: UserRole[] };

export interface UseAdminPermissionsOptions extends Omit<
  UseQueryOptions<MyPermissionsDto, Error, MyPermissionsDto, QueryKey>,
  "queryKey" | "queryFn"
> {
  isAuthenticated?: boolean;
}

/**
 * Fetch admin permissions for the current user.
 *
 * @param options Query options. If isAuthenticated is provided, the query is
 *   automatically disabled when false. Otherwise, pass enabled through options.
 */
export function useAdminPermissions(options?: UseAdminPermissionsOptions) {
  const { isAuthenticated, ...queryOptions } = options ?? {};

  return useApiQuery<MyPermissionsDto>(
    queryKeys.admin.permissions.me(),
    () =>
      httpClient<MyPermissionsDto>({
        url: endpoints.admin.permissions.me,
        method: "GET",
      }),
    {
      ...queryOptions,
      enabled: isAuthenticated !== false && queryOptions.enabled !== false,
    },
  );
}
