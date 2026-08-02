import type {
  Permission,
  UserPermissionDto,
  UserRoleAssignmentDto,
  UserRole,
  AdminUserListDto,
  AdminTopicDetailDto,
  CreateTopicWithTranslationsDto,
  UpdateTopicWithTranslationsDto,
  ScholarFormDataDto,
  ScholarTitle,
  UserScholarRoleDto,
  UserTranslatorRoleDto,
  ScholarPermissionType,
  Locale,
} from "@sd/core-contracts";

import { httpClient, endpoints } from "@sd/core-contracts";

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

// --- Scholar-scoped roles (identified by scholar slug, not id) ---

export type AdminScholarRolesListResponse = {
  scholarRoles: UserScholarRoleDto[];
};

export function fetchUserScholarRoles(userId: string) {
  return httpClient<AdminScholarRolesListResponse>({
    url: endpoints.admin.scholarRoles.list(userId),
    method: "GET",
  });
}

export function grantScholarRole(
  userId: string,
  scholarSlug: string,
  permissionType: ScholarPermissionType,
) {
  return httpClient<{ success: boolean; message: string }>({
    url: endpoints.admin.scholarRoles.grant(userId),
    method: "POST",
    body: { scholarSlug, permissionType },
  });
}

export function revokeScholarRole(
  userId: string,
  scholarSlug: string,
  permissionType: ScholarPermissionType,
) {
  return httpClient<{ success: boolean; message: string }>({
    url: endpoints.admin.scholarRoles.revoke(userId, scholarSlug, permissionType),
    method: "DELETE",
    body: {},
  });
}

// --- Translator-scoped roles (locale set, optionally scoped to one scholar) ---

export type AdminTranslatorRolesListResponse = {
  translatorRoles: UserTranslatorRoleDto[];
};

export function fetchUserTranslatorRoles(userId: string) {
  return httpClient<AdminTranslatorRolesListResponse>({
    url: endpoints.admin.translatorRoles.list(userId),
    method: "GET",
  });
}

export function syncTranslatorRoles(
  userId: string,
  scholarSlug: string | null,
  locales: Locale[],
  canPublish: boolean,
) {
  return httpClient<{ success: boolean; message: string }>({
    url: endpoints.admin.translatorRoles.sync(userId),
    method: "PUT",
    body: { scholarSlug, locales, canPublish },
  });
}

export function updateTranslatorPublish(
  userId: string,
  locale: Locale,
  canPublish: boolean,
  scholarSlug?: string | null,
) {
  return httpClient<{ success: boolean; message: string }>({
    url: endpoints.admin.translatorRoles.updatePublish(userId, locale),
    method: "PATCH",
    body: { scholarSlug, canPublish },
  });
}

// --- Scholars ---

export type AdminScholarInput = {
  name: string;
  slug: string;
  bio?: string;
  imageUrl?: string;
  isActive?: boolean;
  country?: string;
  mainLanguage?: "en" | "ar";
  title?: ScholarTitle;
  orderIndex?: number;
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
  const body = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined && v !== ""),
  );
  return httpClient<unknown>({
    url: endpoints.admin.scholars.update(id),
    method: "PATCH",
    body,
  });
}

export function fetchScholarFormData(id: string) {
  return httpClient<ScholarFormDataDto>({
    url: endpoints.admin.scholars.formData(id),
    method: "GET",
  });
}

// --- Topics ---

export type AdminTopicInput = {
  slug: string;
  name: { en: string; ar?: string };
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

// --- Topics — combined with translations ---

export function fetchAdminTopic(slug: string) {
  return httpClient<AdminTopicDetailDto>({
    url: endpoints.admin.topics.detail(slug),
    method: "GET",
  });
}

export function createTopicWithTranslations(data: CreateTopicWithTranslationsDto) {
  return httpClient<AdminTopicDetailDto>({
    url: endpoints.admin.topics.create,
    method: "POST",
    body: data,
  });
}

export function updateTopicWithTranslations(slug: string, data: UpdateTopicWithTranslationsDto) {
  return httpClient<AdminTopicDetailDto>({
    url: endpoints.admin.topics.update(slug),
    method: "PUT",
    body: data,
  });
}

// --- Users ---

export function fetchAdminUsers(params?: { q?: string; role?: string }) {
  const url = endpoints.admin.users.list;
  const query = new URLSearchParams();
  if (params?.q) {
    query.append("q", params.q);
  }
  if (params?.role) {
    query.append("role", params.role);
  }
  const queryString = query.toString();
  return httpClient<AdminUserListDto>({
    url: queryString ? `${url}?${queryString}` : url,
    method: "GET",
  });
}
