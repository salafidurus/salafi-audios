/** Documents this module's responsibility and public boundary. */
"use client";

import type { ScholarTitle } from "@sd/core-contracts";

import { useTranslation } from "@/core/i18n/use-translation";
import { FormSection } from "@/features/admin/components/FormSection";
import { ImageUploadEditor } from "@/shared/components/ImageUploadEditor";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/ui/dropdown";
import { InputField } from "@/shared/components/ui/input-field";

import type { FormAction, FormState } from "../../hooks/Scholar/useScholarForm";

import { SCHOLAR_TITLE_LABELS, SCHOLAR_TITLES_ARRAY } from "./constants";
import styles from "./personal-data-section.module.css";

interface GeneralDataSectionProps {
  formData: FormState;
  dispatch: React.Dispatch<FormAction>;
  onImageStaged: (file: File | null, preview: string | null) => void;
  isEditing?: boolean;
}

export function GeneralDataSection({
  formData,
  dispatch,
  onImageStaged,
  isEditing = false,
}: GeneralDataSectionProps) {
  const { t } = useTranslation();

  return (
    <FormSection title={t("admin.scholars.generalInfo", "General Information")}>
      <div className={styles.container}>
        <div className={styles.avatarColumn}>
          <ImageUploadEditor
            imageUrl={formData.imageUrl}
            onImageStaged={onImageStaged}
            uploadLabel={t("admin.scholars.uploadAvatar", "Upload avatar")}
            changeLabel={t("admin.scholars.changeAvatar", "Change avatar")}
            selectLabel={t("admin.scholars.selectAvatar", "Select avatar image")}
            altText={t("admin.scholars.avatarAlt", "Scholar avatar")}
          />
        </div>

        <div className={styles.fieldsColumn}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="scholar-slug">
              {t("admin.scholars.slugLabel", "Slug")} *
            </label>
            <InputField
              id="scholar-slug"
              type="text"
              value={formData.slug}
              onChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "slug", value })}
              placeholder={t("admin.scholars.slugPlaceholder", "scholar-slug")}
              disabled={isEditing}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="scholar-title">
              {t("admin.scholars.titleLabel", "Title")}
            </label>
            <Dropdown
              value={formData.title ?? ""}
              onValueChange={(value) =>
                // SAFETY: the title dropdown renders only ScholarTitle entries from SCHOLAR_TITLES_ARRAY.
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "title",
                  value: value as ScholarTitle,
                })
              }
            >
              <DropdownTrigger
                id="scholar-title"
                placeholder={t("admin.scholars.titlePlaceholder", "Select Title")}
              />
              <DropdownContent>
                {SCHOLAR_TITLES_ARRAY.map((title) => (
                  <DropdownItem key={title} value={title}>
                    {SCHOLAR_TITLE_LABELS[title]}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>
          </div>
        </div>
      </div>
    </FormSection>
  );
}
