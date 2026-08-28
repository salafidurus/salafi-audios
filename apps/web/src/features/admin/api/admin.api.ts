import type {
  AdminTopicDetailDto,
  CreateTopicWithTranslationsDto,
  UpdateTopicWithTranslationsDto,
  ScholarFormDataDto,
  ScholarTitle,
  ReplaceUserAccessRequest,
  UserAccessSnapshot,
} from "@sd/core-contracts";

import { httpClient, endpoints } from "@sd/core-contracts";

/** Exposes administrative access, scholar, and topic API operations. */
/** Reads the user's current access assignments for the admin access editor. */
export function fetchUserAccess(userId: string) {
  return httpClient<UserAccessSnapshot>({
    url: endpoints.admin.users.access(userId),
    method: "GET",
  });
}

/** Replaces all access assignments for a user with the supplied snapshot. */
export function replaceUserAccess(userId: string, body: ReplaceUserAccessRequest) {
  return httpClient<UserAccessSnapshot>({
    url: endpoints.admin.users.access(userId),
    method: "PUT",
    body,
  });
}

// --- Scholars ---

/** Fields accepted when creating or partially updating a scholar. */
export type AdminScholarInput = {
  name: string;
  /** Stable URL identity used by public scholar routes. */
  slug: string;
  bio?: string;
  imageUrl?: string;
  isActive?: boolean;
  country?: string;
  /** Primary language used when presenting the scholar's content. */
  mainLanguage?: "en" | "ar";
  title?: ScholarTitle;
  orderIndex?: number;
  socialTwitter?: string;
  socialTelegram?: string;
  socialYoutube?: string;
  socialWebsite?: string;
};

/** Creates a scholar record from the admin form payload. */
export function createScholar(data: AdminScholarInput) {
  return httpClient<unknown>({
    url: endpoints.admin.scholars.create,
    method: "POST",
    body: data,
  });
}

/** Patches only supplied scholar fields; blank and undefined values are omitted. */
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

/** Loads scholar values and select options needed by the editor. */
export function fetchScholarFormData(id: string) {
  return httpClient<ScholarFormDataDto>({
    url: endpoints.admin.scholars.formData(id),
    method: "GET",
  });
}

// --- Topics ---

/** Deletes a topic identified by its stable slug. */
export function deleteTopic(slug: string) {
  return httpClient<unknown>({
    url: endpoints.admin.topics.delete(slug),
    method: "DELETE",
  });
}

// --- Topics — combined with translations ---

/** Loads topic content together with its translation state for administrators. */
export function fetchAdminTopic(slug: string) {
  return httpClient<AdminTopicDetailDto>({
    url: endpoints.admin.topics.detail(slug),
    method: "GET",
  });
}

/** Creates a topic and its submitted translations in one API operation. */
export function createTopicWithTranslations(data: CreateTopicWithTranslationsDto) {
  return httpClient<AdminTopicDetailDto>({
    url: endpoints.admin.topics.create,
    method: "POST",
    body: data,
  });
}

/** Updates a topic and its submitted translations using the existing slug as identity. */
export function updateTopicWithTranslations(slug: string, data: UpdateTopicWithTranslationsDto) {
  return httpClient<AdminTopicDetailDto>({
    url: endpoints.admin.topics.update(slug),
    method: "PUT",
    body: data,
  });
}

// --- Users ---
