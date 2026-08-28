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

/** Documents this module's responsibility and public boundary. */
export function saveListingTranslation(id: string, data: SaveListingTranslationDto) {
  return httpClient<TranslationViewDto>({
    url: endpoints.translations.listings.save(id),
    method: "POST",
    body: data,
  });
}

export function publishListingTranslation(id: string, locale: string) {
  return httpClient<TranslationViewDto>({
    url: endpoints.translations.listings.publish(id, locale),
    method: "POST",
  });
}

export function unpublishListingTranslation(id: string, locale: string) {
  return httpClient<TranslationViewDto>({
    url: endpoints.translations.listings.unpublish(id, locale),
    method: "POST",
  });
}

// --- Scholar translations ---

export function saveScholarTranslation(id: string, data: SaveScholarTranslationDto) {
  return httpClient<TranslationViewDto>({
    url: endpoints.translations.scholars.save(id),
    method: "POST",
    body: data,
  });
}

export function publishScholarTranslation(id: string, locale: string) {
  return httpClient<TranslationViewDto>({
    url: endpoints.translations.scholars.publish(id, locale),
    method: "POST",
  });
}

export function unpublishScholarTranslation(id: string, locale: string) {
  return httpClient<TranslationViewDto>({
    url: endpoints.translations.scholars.unpublish(id, locale),
    method: "POST",
  });
}

// --- Topic translations ---
// Topics have no status column and no publish/unpublish endpoints — save only.

export function saveTopicTranslation(id: string, data: SaveTopicTranslationDto) {
  return httpClient<TranslationViewDto>({
    url: endpoints.translations.topics.save(id),
    method: "POST",
    body: data,
  });
}
