"use client";

import React from "react";
import type { Locale } from "@sd/core-contracts";
import { useTranslation } from "@/core/i18n/use-translation";
import type { FormState, FormAction } from "@/features/admin/hooks/Content/useListingForm";
import styles from "./listing-modal.module.css";

interface ListingTranslatableFieldsProps {
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  locale: Locale;
  handleTitleChange: (val: string) => void;
}

export function ListingTranslatableFields({
  state,
  dispatch,
  locale,
  handleTitleChange,
}: ListingTranslatableFieldsProps) {
  const { t } = useTranslation();
  const { title, slug, description, language, translationChanges } = state;
  const isMainLocale = locale === language;
  const translation = translationChanges[locale];

  return (
    <>
      <div className={styles.formGroup}>
        <label htmlFor="lecture-title" className={styles.label}>
          {t("admin.contents.listing.titleLabel", "Title")}
        </label>
        <input
          id="lecture-title"
          type="text"
          className={styles.input}
          value={isMainLocale ? title : translation?.title || ""}
          onChange={(e) => {
            if (isMainLocale) {
              handleTitleChange(e.target.value);
            } else {
              dispatch({
                type: "UPDATE_TRANSLATION",
                locale,
                field: "title",
                value: e.target.value,
              });
            }
          }}
          required
        />
      </div>

      {isMainLocale && (
        <div className={styles.formGroup}>
          <label htmlFor="lecture-slug" className={styles.label}>
            {t("admin.contents.listing.slugLabel", "Slug")}
          </label>
          <input
            id="lecture-slug"
            type="text"
            className={styles.input}
            value={slug}
            onChange={(e) =>
              dispatch({ type: "UPDATE_FIELD", field: "slug", value: e.target.value })
            }
            placeholder={t(
              "admin.contents.listing.slugPlaceholder",
              "Auto-generated if left blank",
            )}
          />
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="lecture-description" className={styles.label}>
          {t("admin.contents.listing.descriptionLabel", "Description")}
        </label>
        <textarea
          id="lecture-description"
          className={styles.textarea}
          value={isMainLocale ? description : translation?.description || ""}
          onChange={(e) => {
            if (isMainLocale) {
              dispatch({ type: "UPDATE_FIELD", field: "description", value: e.target.value });
            } else {
              dispatch({
                type: "UPDATE_TRANSLATION",
                locale,
                field: "description",
                value: e.target.value,
              });
            }
          }}
          rows={3}
        />
      </div>
    </>
  );
}
