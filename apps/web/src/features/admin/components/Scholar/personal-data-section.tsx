"use client";

import type { CreateScholarDto } from "@sd/core-contracts";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/Dropdown";
import { EditableInput } from "@/shared/components/EditableInput";
import { FormSection } from "@/features/admin/components/FormSection";
import { ScholarAvatarEditor } from "./scholar-avatar-editor";
import { useTranslation } from "@/core/i18n/use-translation";
import type { FormAction } from "../../hooks/Scholar/useScholarForm";
import { SCHOLAR_TITLE_LABELS, SCHOLAR_TITLES_ARRAY } from "./constants";
import styles from "./personal-data-section.module.css";

interface PersonalDataSectionProps {
  formData: CreateScholarDto;
  dispatch: React.Dispatch<FormAction>;
  isEditing: boolean;
  onImageStaged: (file: File | null, preview: string | null) => void;
}

export function PersonalDataSection({
  formData,
  dispatch,
  isEditing,
  onImageStaged,
}: PersonalDataSectionProps) {
  const { t } = useTranslation();

  const handleNameChange = (value: string) => {
    dispatch({ type: "UPDATE_FIELD", field: "name", value });
    if (!isEditing) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      dispatch({ type: "UPDATE_FIELD", field: "slug", value: generatedSlug });
    }
  };

  return (
    <FormSection title={t("admin.scholars.personalData", "Personal Data")}>
      <div className={styles.container}>
        <div className={styles.avatarColumn}>
          <ScholarAvatarEditor
            imageUrl={formData.imageUrl}
            onImageStaged={onImageStaged}
          />
        </div>

        <div className={styles.fieldsColumn}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="scholar-name">
              {t("admin.scholars.nameLabel", "Name *")}
            </label>
            <EditableInput
              id="scholar-name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder={t("admin.scholars.namePlaceholder", "Scholar name")}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="scholar-slug">
              {t("admin.scholars.slugLabel", "Slug *")}
            </label>
            <EditableInput
              id="scholar-slug"
              value={formData.slug}
              onChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "slug", value })}
              placeholder={t("admin.scholars.slugPlaceholder", "scholar-slug")}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="scholar-title">
              {t("admin.scholars.titleLabel", "Title")}
            </label>
            <Dropdown
              value={formData.title ?? ""}
              onValueChange={(value) =>
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "title",
                  value: value as CreateScholarDto["title"],
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

          <div className={styles.field}>
            <label className={styles.label} htmlFor="scholar-bio">
              {t("admin.scholars.bioLabel", "Bio")}
            </label>
            <textarea
              id="scholar-bio"
              value={formData.bio ?? ""}
              onChange={(e) =>
                dispatch({ type: "UPDATE_FIELD", field: "bio", value: e.target.value })
              }
              placeholder={t("admin.scholars.bioPlaceholder", "Scholar biography")}
              className={styles.textarea}
            />
          </div>
        </div>
      </div>
    </FormSection>
  );
}
