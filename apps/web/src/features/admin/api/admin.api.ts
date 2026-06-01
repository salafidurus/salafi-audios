import { httpClient, endpoints } from "@sd/core-contracts";
import type { AdminPermission } from "@sd/core-contracts";

// --- Permissions ---

export type AdminPermissionsListResponse = {
  permissions: Array<{
    userId: string;
    permission: AdminPermission;
    grantedAt: string;
    grantedById: string | null;
  }>;
};

export function fetchUserPermissions(userId: string) {
  return httpClient<AdminPermissionsListResponse>({
    url: `${endpoints.admin.permissions.list}/${userId}`,
    method: "GET",
  });
}

export function grantPermission(userId: string, permission: AdminPermission) {
  return httpClient<AdminPermissionsListResponse>({
    url: `${endpoints.admin.permissions.grant}/${userId}`,
    method: "POST",
    body: { permission },
  });
}

export function revokePermission(userId: string, permission: string) {
  return httpClient<AdminPermissionsListResponse>({
    url: endpoints.admin.permissions.revoke(`${userId}/${permission}`),
    method: "DELETE",
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
  name: string;
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

// --- Live ---

export function updateLiveSessionStatus(id: string, status: string) {
  return httpClient<unknown>({
    url: endpoints.admin.live.updateStatus(id),
    method: "PATCH",
    body: { status },
  });
}
