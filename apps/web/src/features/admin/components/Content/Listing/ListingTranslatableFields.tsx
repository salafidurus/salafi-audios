"use client";

import React from "react";
import { InputField } from "@/shared/components/InputField";
import { useTranslation } from "@/core/i18n/use-translation";
import type { FormAction, FormState } from "@/features/admin/hooks/Content/useListingForm";
import styles from "./listing-modal.module.css";

interface ListingTranslatableFieldsProps {
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  handleTitleChange: (val: string) => void;
}

export function ListingTranslatableFields({
  state,
  dispatch,
  handleTitleChange,
}: ListingTranslatableFieldsProps) {
  const { t } = useTranslation();
  const { title, description } = state;

  return (
    <>
      <div className={styles.formGroup}>
        <label htmlFor="lecture-title" className={styles.label}>
          {t("admin.contents.listing.titleLabel", "Title")} *
        </label>
        <InputField
          id="lecture-title"
          type="text"
          value={title}
          onChange={handleTitleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="lecture-description" className={styles.label}>
          {t("admin.contents.listing.descriptionLabel", "Description")}
        </label>
        <InputField
          id="lecture-description"
          type="textarea"
          value={description}
          onChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "description", value })}
          rows={3}
        />
      </div>
    </>
  );
}
