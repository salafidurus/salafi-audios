import {
  endpoints,
  httpClient,
  useApiQuery,
  type TranslationViewDto,
  type SaveTranslationDto,
  type TranslationTarget,
} from "@sd/core-contracts";
import type { Locale } from "@sd/core-i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function translationQueryKey(target: TranslationTarget) {
  return ["translations", target.entity, target] as const;
}

function resolveTranslationEndpoint(
  target: TranslationTarget,
  action: "list" | "save" | "publish" | "unpublish",
  locale?: string,
): string {
  switch (target.entity) {
    case "scholar":
      if (action === "list") return endpoints.translations.scholars.list(target.scholarId);
      if (action === "save") return endpoints.translations.scholars.save(target.scholarId);
      if (action === "publish")
        return endpoints.translations.scholars.publish(target.scholarId, locale!);
      return endpoints.translations.scholars.unpublish(target.scholarId, locale!);

    case "listing":
      if (action === "list") return endpoints.translations.listings.list(target.listingId);
      if (action === "save") return endpoints.translations.listings.save(target.listingId);
      if (action === "publish")
        return endpoints.translations.listings.publish(target.listingId, locale!);
      return endpoints.translations.listings.unpublish(target.listingId, locale!);

    case "topic":
      if (action === "list") return endpoints.translations.topics.list(target.topicId);
      if (action === "save") return endpoints.translations.topics.save(target.topicId);
      if (action === "publish")
        return endpoints.translations.topics.publish(target.topicId, locale!);
      return endpoints.translations.topics.unpublish(target.topicId, locale!);
  }
}

export function useContentTranslations(target: TranslationTarget) {
  return useApiQuery(
    translationQueryKey(target),
    () =>
      httpClient<{ translations: TranslationViewDto[] }>({
        url: resolveTranslationEndpoint(target, "list"),
        method: "GET",
      }),
    { enabled: true },
  );
}

export function useSaveTranslation(target: TranslationTarget) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: SaveTranslationDto) =>
      httpClient<TranslationViewDto>({
        url: resolveTranslationEndpoint(target, "save"),
        method: "POST",
        body: dto,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: translationQueryKey(target) }),
  });
}

export function usePublishTranslation(target: TranslationTarget) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (locale: Locale) =>
      httpClient<TranslationViewDto>({
        url: resolveTranslationEndpoint(target, "publish", locale),
        method: "POST",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: translationQueryKey(target) }),
  });
}

export function useUnpublishTranslation(target: TranslationTarget) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (locale: Locale) =>
      httpClient<TranslationViewDto>({
        url: resolveTranslationEndpoint(target, "unpublish", locale),
        method: "POST",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: translationQueryKey(target) }),
  });
}
