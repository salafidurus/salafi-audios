"use client";

import React from "react";
import type { Locale } from "@sd/core-contracts";
import { InputField } from "@/shared/components/InputField";
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
          {isMainLocale ? " *" : ""}
        </label>
        <InputField
          id="lecture-title"
          type="text"
          value={isMainLocale ? title : translation?.title || ""}
          onChange={(value) => {
            if (isMainLocale) {
              handleTitleChange(value);
            } else {
              dispatch({
                type: "UPDATE_TRANSLATION",
                locale,
                field: "title",
                value,
              });
            }
          }}
          required={isMainLocale}
        />
      </div>

      {isMainLocale && (
        <div className={styles.formGroup}>
          <label htmlFor="lecture-slug" className={styles.label}>
            {t("admin.contents.listing.slugLabel", "Slug")} *
          </label>
          <InputField
            id="lecture-slug"
            type="text"
            value={slug}
            onChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "slug", value })}
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
        <InputField
          id="lecture-description"
          type="textarea"
          value={isMainLocale ? description : translation?.description || ""}
          onChange={(value) => {
            if (isMainLocale) {
              dispatch({ type: "UPDATE_FIELD", field: "description", value });
            } else {
              dispatch({
                type: "UPDATE_TRANSLATION",
                locale,
                field: "description",
                value,
              });
            }
          }}
          rows={3}
        />
      </div>
    </>
  );
}
