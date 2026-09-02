import type {
  SaveListingTranslationDto,
  SaveScholarTranslationDto,
  SaveTopicTranslationDto,
  TranslationViewDto,
} from "@sd/core-contracts";

import { httpClient, endpoints } from "@sd/core-contracts";

// --- Listing translations ---
// Thin wrappers over the standalone per-locale translation endpoints
// (already used by nothing else in the web UI before this modal).

/** Exposes the per-locale translation API boundary used by admin editors. */
/** Provides per-locale save and publication operations for admin translation editors. */
export function saveListingTranslation(id: string, data: SaveListingTranslationDto) {
  return httpClient<TranslationViewDto>({
    url: endpoints.translations.listings.save(id),
    method: "POST",
    body: data,
  });
}

/** Publishes one saved listing translation for the requested locale. */
export function publishListingTranslation(id: string, locale: string) {
  return httpClient<TranslationViewDto>({
    url: endpoints.translations.listings.publish(id, locale),
    method: "POST",
  });
}

/** Removes publication from one listing translation without deleting its draft. */
export function unpublishListingTranslation(id: string, locale: string) {
  return httpClient<TranslationViewDto>({
    url: endpoints.translations.listings.unpublish(id, locale),
    method: "POST",
  });
}

// --- Scholar translations ---

/** Saves a scholar translation draft for one locale. */
export function saveScholarTranslation(id: string, data: SaveScholarTranslationDto) {
  return httpClient<TranslationViewDto>({
    url: endpoints.translations.scholars.save(id),
    method: "POST",
    body: data,
  });
}

/** Publishes one saved scholar translation for the requested locale. */
export function publishScholarTranslation(id: string, locale: string) {
  return httpClient<TranslationViewDto>({
    url: endpoints.translations.scholars.publish(id, locale),
    method: "POST",
  });
}

/** Removes publication from one scholar translation while retaining its draft. */
export function unpublishScholarTranslation(id: string, locale: string) {
  return httpClient<TranslationViewDto>({
    url: endpoints.translations.scholars.unpublish(id, locale),
    method: "POST",
  });
}

// --- Topic translations ---
// Topics have no status column and no publish/unpublish endpoints — save only.

/** Saves topic translation content; topics have no separate publication operation. */
export function saveTopicTranslation(id: string, data: SaveTopicTranslationDto) {
  return httpClient<TranslationViewDto>({
    url: endpoints.translations.topics.save(id),
    method: "POST",
    body: data,
  });
}
