"use client";

import Image from "next/image";
import type { CreateScholarDto } from "@sd/core-contracts";
import { FormSection } from "@/features/admin/components/FormSection";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./review-section.module.css";

interface ReviewSectionProps {
  formData: CreateScholarDto;
  changedFields: Record<string, boolean>;
  mainLanguageName?: string;
  translationName?: string;
  translationBio?: string;
  stagedImagePreview: string | null;
}

export function ReviewSection({
  formData,
  changedFields,
  mainLanguageName,
  translationName,
  translationBio,
  stagedImagePreview,
}: ReviewSectionProps) {
  const { t } = useTranslation();

  const otherLanguage = formData.mainLanguage === "en" ? "ar" : "en";
  const otherLanguageName = otherLanguage === "en" ? "English" : "العربية";
  const hasTranslations = translationName || translationBio;

  // Check if any changed field should be displayed
  const hasDetailChanges =
    changedFields.name ||
    changedFields.slug ||
    changedFields.bio ||
    changedFields.title ||
    changedFields.country;
  const hasSocialChanges =
    changedFields.socialTwitter ||
    changedFields.socialTelegram ||
    changedFields.socialYoutube ||
    changedFields.socialWebsite;
  const hasAnyData = hasDetailChanges || hasTranslations || hasSocialChanges || stagedImagePreview;

  if (!hasAnyData) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>
          {t("admin.scholars.noChangesMadeYet", "No changes made yet")}
        </p>
      </div>
    );
  }

  return (
    <>
      {stagedImagePreview && (
        <FormSection title={t("admin.scholars.avatar", "Avatar")}>
          <div className={styles.imagePreview}>
            <Image
              src={stagedImagePreview}
              alt={formData.name}
              fill
              sizes="200px"
              className={styles.imageContent}
            />
          </div>
        </FormSection>
      )}

      {hasDetailChanges && (
        <FormSection title={t("admin.scholars.details", "Details")}>
          <div className={styles.grid}>
            {changedFields.name && formData.name && (
              <div className={styles.field}>
                <div className={styles.label}>{t("admin.scholars.nameLabel", "Name")}</div>
                <div className={styles.value}>{formData.name}</div>
              </div>
            )}
            {changedFields.slug && formData.slug && (
              <div className={styles.field}>
                <div className={styles.label}>{t("admin.scholars.slugLabel", "Slug")}</div>
                <div className={styles.value}>{formData.slug}</div>
              </div>
            )}
            {changedFields.bio && formData.bio && (
              <div className={styles.field}>
                <div className={styles.label}>{t("admin.scholars.bioLabel", "Bio")}</div>
                <div className={styles.value}>{formData.bio}</div>
              </div>
            )}
            {changedFields.title && formData.title && (
              <div className={styles.field}>
                <div className={styles.label}>{t("admin.scholars.titleLabel", "Title")}</div>
                <div className={styles.value}>{formData.title}</div>
              </div>
            )}
            {changedFields.country && formData.country && (
              <div className={styles.field}>
                <div className={styles.label}>{t("admin.scholars.countryLabel", "Country")}</div>
                <div className={styles.value}>{formData.country}</div>
              </div>
            )}
          </div>
        </FormSection>
      )}

      {(translationName || translationBio) && (
        <FormSection title={t("admin.scholars.translation", `Translation (${otherLanguageName})`)}>
          <div className={styles.grid}>
            {translationName && (
              <div className={styles.field}>
                <div className={styles.label}>{t("admin.scholars.nameLabel", "Name")}</div>
                <div className={styles.value}>{translationName}</div>
              </div>
            )}
            {translationBio && (
              <div className={styles.field}>
                <div className={styles.label}>{t("admin.scholars.bioLabel", "Bio")}</div>
                <div className={styles.value}>{translationBio}</div>
              </div>
            )}
          </div>
        </FormSection>
      )}

      {hasSocialChanges && (
        <FormSection title={t("admin.scholars.socialMedia", "Social Media")}>
          <div className={styles.grid}>
            {changedFields.socialTwitter && formData.socialTwitter && (
              <div className={styles.field}>
                <div className={styles.label}>Twitter</div>
                <div className={styles.value}>{formData.socialTwitter}</div>
              </div>
            )}
            {changedFields.socialTelegram && formData.socialTelegram && (
              <div className={styles.field}>
                <div className={styles.label}>Telegram</div>
                <div className={styles.value}>{formData.socialTelegram}</div>
              </div>
            )}
            {changedFields.socialYoutube && formData.socialYoutube && (
              <div className={styles.field}>
                <div className={styles.label}>YouTube</div>
                <div className={styles.value}>{formData.socialYoutube}</div>
              </div>
            )}
            {changedFields.socialWebsite && formData.socialWebsite && (
              <div className={styles.field}>
                <div className={styles.label}>Website</div>
                <div className={styles.value}>{formData.socialWebsite}</div>
              </div>
            )}
          </div>
        </FormSection>
      )}
    </>
  );
}
