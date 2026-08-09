import type {
  AdminUserListDto,
  AdminTopicDetailDto,
  CreateTopicWithTranslationsDto,
  UpdateTopicWithTranslationsDto,
  ScholarFormDataDto,
  ScholarTitle,
  ReplaceUserAccessRequest,
  UserAccessSnapshot,
} from "@sd/core-contracts";

import { httpClient, endpoints } from "@sd/core-contracts";

export function fetchUserAccess(userId: string) {
  return httpClient<UserAccessSnapshot>({
    url: endpoints.admin.users.access(userId),
    method: "GET",
  });
}

export function replaceUserAccess(userId: string, body: ReplaceUserAccessRequest) {
  return httpClient<UserAccessSnapshot>({
    url: endpoints.admin.users.access(userId),
    method: "PUT",
    body,
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
