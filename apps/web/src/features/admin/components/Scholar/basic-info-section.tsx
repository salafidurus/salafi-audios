"use client";

import Image from "next/image";
import { AlertCircle, Loader } from "lucide-react";
import type { CreateScholarDto } from "@sd/core-contracts";
import { EditableInput } from "@/shared/components/EditableInput";
import { EditableTextarea } from "@/shared/components/EditableTextarea";
import { FormSection } from "@/features/admin/components/FormSection";
import { useTranslation } from "@/core/i18n/use-translation";
import type { FormAction } from "./ScholarModal";
import styles from "./scholar-modal.module.css";

interface BasicInfoSectionProps {
  formData: CreateScholarDto;
  dispatch: React.Dispatch<FormAction>;
  isEditing: boolean;
  imageLoading: boolean;
  imageError: boolean;
}

export function BasicInfoSection({
  formData,
  dispatch,
  isEditing,
  imageLoading,
  imageError,
}: BasicInfoSectionProps) {
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

  const handleImageUrlChange = (value: string) => {
    dispatch({ type: "UPDATE_FIELD", field: "imageUrl", value });
    dispatch({ type: "SET_IMAGE_ERROR", error: false });
    dispatch({ type: "SET_IMAGE_LOADING", loading: false });
  };

  return (
    <FormSection title={t("admin.scholars.basicInfo", "Basic Information")}>
      <div className={styles.twoCol}>
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
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="scholar-bio">
          {t("admin.scholars.bioLabel", "Bio")}
        </label>
        <EditableTextarea
          id="scholar-bio"
          value={formData.bio ?? ""}
          onChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "bio", value })}
          placeholder={t("admin.scholars.bioPlaceholder", "Brief biography...")}
          rows={4}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="scholar-image-url">
          {t("admin.scholars.imageUrlLabel", "Image URL")}
        </label>
        <EditableInput
          id="scholar-image-url"
          type="url"
          value={formData.imageUrl ?? ""}
          onChange={handleImageUrlChange}
          placeholder={t("admin.scholars.imageUrlPlaceholder", "https://...")}
        />
        {formData.imageUrl && (
          <div className={styles.imagePreview}>
            {imageLoading && (
              <div className={styles.imageLoadingState}>
                <Loader size={24} className={styles.loadingSpinner} />
                <span>{t("admin.scholars.loadingImage", "Loading image...")}</span>
              </div>
            )}
            {imageError && (
              <div className={styles.imageErrorState}>
                <AlertCircle size={24} />
                <span>{t("admin.scholars.failedImage", "Failed to load image")}</span>
              </div>
            )}
            {!imageError && (
              <Image
                src={formData.imageUrl}
                alt={t("admin.scholars.imagePreviewAlt", "Preview")}
                width={200}
                height={200}
                style={{ objectFit: "contain" }}
                className={styles.previewImage}
                onLoadingComplete={() => dispatch({ type: "SET_IMAGE_LOADING", loading: false })}
                onError={() => {
                  dispatch({ type: "SET_IMAGE_ERROR", error: true });
                  dispatch({ type: "SET_IMAGE_LOADING", loading: false });
                }}
                onLoad={() => dispatch({ type: "SET_IMAGE_LOADING", loading: true })}
              />
            )}
          </div>
        )}
      </div>
    </FormSection>
  );
}
