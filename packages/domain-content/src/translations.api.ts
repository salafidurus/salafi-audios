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

    case "lecture":
      if (action === "list") return endpoints.translations.lectures.list(target.lectureId);
      if (action === "save") return endpoints.translations.lectures.save(target.lectureId);
      if (action === "publish")
        return endpoints.translations.lectures.publish(target.lectureId, locale!);
      return endpoints.translations.lectures.unpublish(target.lectureId, locale!);

    case "topic":
      if (action === "list") return endpoints.translations.topics.list(target.topicId);
      if (action === "save") return endpoints.translations.topics.save(target.topicId);
      if (action === "publish")
        return endpoints.translations.topics.publish(target.topicId, locale!);
      return endpoints.translations.topics.unpublish(target.topicId, locale!);

    case "series":
      if (action === "list")
        return endpoints.translations.series.list(target.scholarId, target.seriesId);
      if (action === "save")
        return endpoints.translations.series.save(target.scholarId, target.seriesId);
      if (action === "publish")
        return endpoints.translations.series.publish(target.scholarId, target.seriesId, locale!);
      return endpoints.translations.series.unpublish(target.scholarId, target.seriesId, locale!);

    case "collection":
      if (action === "list")
        return endpoints.translations.collections.list(target.scholarId, target.collectionId);
      if (action === "save")
        return endpoints.translations.collections.save(target.scholarId, target.collectionId);
      if (action === "publish")
        return endpoints.translations.collections.publish(
          target.scholarId,
          target.collectionId,
          locale!,
        );
      return endpoints.translations.collections.unpublish(
        target.scholarId,
        target.collectionId,
        locale!,
      );
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
