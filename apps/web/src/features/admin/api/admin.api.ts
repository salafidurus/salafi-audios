import { httpClient, endpoints } from "@sd/core-contracts";
import type {
  Permission,
  UserPermissionDto,
  UserRoleAssignmentDto,
  UserRole,
  AdminUserListDto,
} from "@sd/core-contracts";

// --- Permissions ---

export type AdminPermissionsListResponse = {
  permissions: UserPermissionDto[];
};

export function fetchUserPermissions(userId: string) {
  return httpClient<AdminPermissionsListResponse>({
    url: endpoints.admin.permissions.list(userId),
    method: "GET",
  });
}

export function grantPermission(userId: string, permission: Permission) {
  return httpClient<AdminPermissionsListResponse>({
    url: endpoints.admin.permissions.grant(userId),
    method: "POST",
    body: { permission },
  });
}

export function revokePermission(userId: string, permission: string) {
  return httpClient<AdminPermissionsListResponse>({
    url: endpoints.admin.permissions.revoke(userId, permission),
    method: "DELETE",
    body: {},
  });
}

// --- Roles ---

export type AdminRolesListResponse = {
  roles: UserRoleAssignmentDto[];
};

export function fetchUserRoles(userId: string) {
  return httpClient<AdminRolesListResponse>({
    url: endpoints.admin.roles.grant(userId),
    method: "GET",
  });
}

export function grantRole(userId: string, role: UserRole) {
  return httpClient<AdminRolesListResponse>({
    url: endpoints.admin.roles.grant(userId),
    method: "POST",
    body: { role },
  });
}

export function revokeRole(userId: string, role: UserRole) {
  return httpClient<AdminRolesListResponse>({
    url: endpoints.admin.roles.revoke(userId, role),
    method: "DELETE",
    body: {},
  });
}

// --- Scholars ---

export type AdminScholarInput = {
  name: string;
  slug: string;
  bio?: string;
  imageUrl?: string;
  isKibar?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  country?: string;
  mainLanguage?: "en" | "ar";
  socialTwitter?: string;
  socialTelegram?: string;
  socialYoutube?: string;
  socialWebsite?: string;
};

export function createScholar(data: AdminScholarInput) {
  return httpClient<unknown>({
    url: endpoints.admin.scholars.create,
    method: "POST",
    body: data,
  });
}

export function updateScholar(id: string, data: Partial<AdminScholarInput>) {
  return httpClient<unknown>({
    url: endpoints.admin.scholars.update(id),
    method: "PATCH",
    body: data,
  });
}

// --- Topics ---

export type AdminTopicInput = {
  slug: string;
  name: { en: string; ar?: string };
  parentSlug?: string;
};

export function createTopic(data: AdminTopicInput) {
  return httpClient<unknown>({
    url: endpoints.admin.topics.create,
    method: "POST",
    body: data,
  });
}

export function updateTopic(slug: string, data: AdminTopicInput) {
  return httpClient<unknown>({
    url: endpoints.admin.topics.update(slug),
    method: "PATCH",
    body: data,
  });
}

export function deleteTopic(slug: string) {
  return httpClient<unknown>({
    url: endpoints.admin.topics.delete(slug),
    method: "DELETE",
  });
}

// --- Users ---

export function fetchAdminUsers(params?: { q?: string; role?: string }) {
  const url = endpoints.admin.users.list;
  const query = new URLSearchParams();
  if (params?.q) query.append("q", params.q);
  if (params?.role) query.append("role", params.role);
  const queryString = query.toString();
  return httpClient<AdminUserListDto>({
    url: queryString ? `${url}?${queryString}` : url,
    method: "GET",
  });
}

// --- Live ---

export async function updateLiveSessionStatus(id: string, status: string): Promise<void> {
  const actionMap: Record<string, string> = {
    live: "go-live",
    ended: "end",
    scheduled: "reschedule",
  };
  const action = actionMap[status];
  if (!action) throw new Error(`Unknown live session status: ${status}`);
  await httpClient<void>({
    url: `/admin/live/sessions/${id}/${action}`,
    method: "PATCH",
  });
}
