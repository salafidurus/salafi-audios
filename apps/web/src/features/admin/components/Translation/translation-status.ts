import type { Locale } from "@sd/core-contracts";

import type { TranslationFormState } from "@/features/admin/hooks/Translation/useTranslationForm";

/** Documents this module's responsibility and public boundary. */
export type StatusDot = "published" | "draft" | "notCreated";
export type StatusInfo = { label: string; dot: StatusDot };

/**
 * Shared by the root listing/scholar/topic locale tabs and the translation
 * modal's sub-listing child detail view.
 */
export function statusInfo(
  state: TranslationFormState,
  locale: Locale,
  supportsPublish: boolean,
  t: (key: string, fallback: string) => string,
): StatusInfo {
  const hasTranslation = !!state.initial[locale];
  if (!supportsPublish) {
    return hasTranslation
      ? { label: t("admin.translations.status.saved", "Saved"), dot: "published" }
      : { label: t("admin.translations.status.notCreated", "Not created"), dot: "notCreated" };
  }
  const status = state.translationStatus[locale];
  if (status === "published") {
    return { label: t("admin.translations.status.published", "Published"), dot: "published" };
  }
  if (status === "draft") {
    return { label: t("admin.translations.status.draft", "Draft"), dot: "draft" };
  }
  return { label: t("admin.translations.status.notCreated", "Not created"), dot: "notCreated" };
}
