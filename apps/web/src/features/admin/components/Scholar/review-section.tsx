"use client";

import type { CreateScholarDto } from "@sd/core-contracts";
import { FormSection } from "@/features/admin/components/FormSection";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./review-section.module.css";

interface ReviewSectionProps {
  formData: CreateScholarDto;
  mainLanguageName?: string;
  translationName?: string;
  translationBio?: string;
  stagedImagePreview: string | null;
}

export function ReviewSection({
  formData,
  mainLanguageName,
  translationName,
  translationBio,
  stagedImagePreview,
}: ReviewSectionProps) {
  const { t } = useTranslation();

  const otherLanguage = formData.mainLanguage === "en" ? "ar" : "en";
  const otherLanguageName = otherLanguage === "en" ? "English" : "العربية";

  return (
    <>
      {stagedImagePreview && (
        <FormSection title={t("admin.scholars.avatar", "Avatar")}>
          <div className={styles.imagePreview}>
            <img src={stagedImagePreview} alt={formData.name} />
          </div>
        </FormSection>
      )}

      <FormSection title={t("admin.scholars.details", "Details")}>
        <div className={styles.grid}>
          <div className={styles.field}>
            <div className={styles.label}>{t("admin.scholars.nameLabel", "Name")}</div>
            <div className={styles.value}>{formData.name}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>{t("admin.scholars.slugLabel", "Slug")}</div>
            <div className={styles.value}>{formData.slug}</div>
          </div>
          {formData.bio && (
            <div className={styles.field}>
              <div className={styles.label}>{t("admin.scholars.bioLabel", "Bio")}</div>
              <div className={styles.value}>{formData.bio}</div>
            </div>
          )}
          {formData.title && (
            <div className={styles.field}>
              <div className={styles.label}>{t("admin.scholars.titleLabel", "Title")}</div>
              <div className={styles.value}>{formData.title}</div>
            </div>
          )}
          {formData.country && (
            <div className={styles.field}>
              <div className={styles.label}>{t("admin.scholars.countryLabel", "Country")}</div>
              <div className={styles.value}>{formData.country}</div>
            </div>
          )}
          <div className={styles.field}>
            <div className={styles.label}>
              {t("admin.scholars.mainLanguageLabel", "Main Language")}
            </div>
            <div className={styles.value}>
              {formData.mainLanguage === "en" ? "English" : "العربية"}
            </div>
          </div>
        </div>
      </FormSection>

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

      {(formData.socialTwitter ||
        formData.socialTelegram ||
        formData.socialYoutube ||
        formData.socialWebsite) && (
        <FormSection title={t("admin.scholars.socialMedia", "Social Media")}>
          <div className={styles.grid}>
            {formData.socialTwitter && (
              <div className={styles.field}>
                <div className={styles.label}>Twitter</div>
                <div className={styles.value}>{formData.socialTwitter}</div>
              </div>
            )}
            {formData.socialTelegram && (
              <div className={styles.field}>
                <div className={styles.label}>Telegram</div>
                <div className={styles.value}>{formData.socialTelegram}</div>
              </div>
            )}
            {formData.socialYoutube && (
              <div className={styles.field}>
                <div className={styles.label}>YouTube</div>
                <div className={styles.value}>{formData.socialYoutube}</div>
              </div>
            )}
            {formData.socialWebsite && (
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
