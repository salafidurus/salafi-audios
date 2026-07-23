"use client";

import { useTranslation } from "@/core/i18n/use-translation";
import type { FormState, Locale } from "../../hooks/Content/useListingForm";

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

  if (
    !title &&
    !description &&
    !translationChanges[otherLocale].title &&
    !translationChanges[otherLocale].description
  ) {
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
            {mainLocale === "en" ? "English" : "العربية"}
          </h4>
          {title && (
            <p>
              <strong>Title:</strong> {title}
            </p>
          )}
          {description && (
            <p>
              <strong>Description:</strong> {description}
            </p>
          )}
        </div>
      )}
      {(translationChanges[otherLocale].title || translationChanges[otherLocale].description) && (
        <div>
          <h4 style={{ marginBottom: "0.5rem", color: "var(--content-default)" }}>
            {otherLocale === "en" ? "English" : "العربية"}
          </h4>
          {translationChanges[otherLocale].title && (
            <p>
              <strong>Title:</strong> {translationChanges[otherLocale].title}
            </p>
          )}
          {translationChanges[otherLocale].description && (
            <p>
              <strong>Description:</strong> {translationChanges[otherLocale].description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
