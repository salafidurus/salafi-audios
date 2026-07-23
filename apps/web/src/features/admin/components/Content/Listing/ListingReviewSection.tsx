"use client";

import { useTranslation } from "@/core/i18n/use-translation";
import type { Locale } from "@sd/core-contracts";
import type { FormState } from "@/features/admin/hooks/Content/useListingForm";
import { getLocaleLabel } from "@/features/admin/utils/locale-tabs";

interface ListingReviewSectionProps {
  state: FormState;
  mainLocale: Locale;
  otherLocale: Locale;
}

export function ListingReviewSection({
  state,
  mainLocale,
  otherLocale,
}: ListingReviewSectionProps) {
  const { t } = useTranslation();
  const { title, description, translationChanges } = state;

  const otherTranslation = translationChanges[otherLocale];
  const otherTranslationInitial = state.initialTranslationChanges?.[otherLocale];
  const otherTranslationChanged =
    otherTranslation?.title !== otherTranslationInitial?.title ||
    otherTranslation?.description !== otherTranslationInitial?.description;

  if (!title && !description && !otherTranslationChanged) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "var(--content-tertiary)",
        }}
      >
        {t("admin.scholars.noChangesMadeYet", "No changes made yet")}
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      {(title || description) && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ marginBottom: "0.5rem", color: "var(--content-default)" }}>
            {getLocaleLabel(mainLocale)}
          </h4>
          {title && (
            <p>
              <strong>{t("admin.contents.listing.titleLabel", "Title")}:</strong> {title}
            </p>
          )}
          {description && (
            <p>
              <strong>{t("admin.contents.listing.descriptionLabel", "Description")}:</strong> {description}
            </p>
          )}
        </div>
      )}
      {otherTranslationChanged && (
        <div>
          <h4 style={{ marginBottom: "0.5rem", color: "var(--content-default)" }}>
            {getLocaleLabel(otherLocale)}
          </h4>
          {otherTranslation?.title !== otherTranslationInitial?.title && (
            <p>
              <strong>{t("admin.contents.listing.titleLabel", "Title")}:</strong> {otherTranslation?.title}
            </p>
          )}
          {otherTranslation?.description !== otherTranslationInitial?.description && (
            <p>
              <strong>{t("admin.contents.listing.descriptionLabel", "Description")}:</strong> {otherTranslation?.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
