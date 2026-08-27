import type { Locale } from "@sd/core-i18n";

import {
  endpoints,
  httpClient,
  useApiQuery,
  type TranslationViewDto,
  type SaveTranslationDto,
  type TranslationTarget,
} from "@sd/core-contracts";
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
      return resolveEntityTranslationEndpoint(
        endpoints.translations.scholars,
        target.scholarId,
        action,
        locale,
      );

    case "listing":
      return resolveEntityTranslationEndpoint(
        endpoints.translations.listings,
        target.listingId,
        action,
        locale,
      );

    case "topic":
      if (action === "list") return endpoints.translations.topics.list(target.topicId);
      if (action === "save") return endpoints.translations.topics.save(target.topicId);
      // Topics have no status column — publish/unpublish is not a supported action.
      throw new Error("Topic translations do not support publish/unpublish");
  }
}

function resolveEntityTranslationEndpoint(
  endpointsForEntity: typeof endpoints.translations.scholars,
  id: string,
  action: "list" | "save" | "publish" | "unpublish",
  locale?: string,
): string {
  if (action === "list") return endpointsForEntity.list(id);
  if (action === "save") return endpointsForEntity.save(id);
  if (action === "publish") return endpointsForEntity.publish(id, locale!);
  return endpointsForEntity.unpublish(id, locale!);
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
