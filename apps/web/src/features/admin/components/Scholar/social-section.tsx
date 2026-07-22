"use client";

import type { CreateScholarDto } from "@sd/core-contracts";
import { EditableInput } from "@/shared/components/EditableInput";
import { FormSection } from "@/features/admin/components/FormSection";
import { useTranslation } from "@/core/i18n/use-translation";
import type { FormAction } from "./ScholarModal";
import styles from "./scholar-modal.module.css";

interface SocialSectionProps {
  formData: CreateScholarDto;
  dispatch: React.Dispatch<FormAction>;
}

export function SocialSection({ formData, dispatch }: SocialSectionProps) {
  const { t } = useTranslation();

  return (
    <FormSection title={t("admin.scholars.socialMedia", "Social Media")}>
      <div className={styles.twoCol}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="scholar-twitter">
            {t("admin.scholars.twitterLabel", "X (Twitter)")}
          </label>
          <EditableInput
            id="scholar-twitter"
            type="url"
            value={formData.socialTwitter ?? ""}
            onChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "socialTwitter", value })}
            placeholder="https://x.com/..."
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="scholar-telegram">
            {t("admin.scholars.telegramLabel", "Telegram")}
          </label>
          <EditableInput
            id="scholar-telegram"
            type="url"
            value={formData.socialTelegram ?? ""}
            onChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "socialTelegram", value })}
            placeholder="https://t.me/..."
          />
        </div>
      </div>
      <div className={styles.twoCol}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="scholar-youtube">
            {t("admin.scholars.youtubeLabel", "YouTube")}
          </label>
          <EditableInput
            id="scholar-youtube"
            type="url"
            value={formData.socialYoutube ?? ""}
            onChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "socialYoutube", value })}
            placeholder="https://youtube.com/..."
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="scholar-website">
            {t("admin.scholars.websiteLabel", "Website")}
          </label>
          <EditableInput
            id="scholar-website"
            type="url"
            value={formData.socialWebsite ?? ""}
            onChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "socialWebsite", value })}
            placeholder="https://..."
          />
        </div>
      </div>
      <div className={styles.twoCol}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="scholar-facebook">
            {t("admin.scholars.facebookLabel", "Facebook")}
          </label>
          <EditableInput
            id="scholar-facebook"
            type="url"
            value={formData.socialFacebook ?? ""}
            onChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "socialFacebook", value })}
            placeholder="https://facebook.com/..."
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="scholar-instagram">
            {t("admin.scholars.instagramLabel", "Instagram")}
          </label>
          <EditableInput
            id="scholar-instagram"
            type="url"
            value={formData.socialInstagram ?? ""}
            onChange={(value) =>
              dispatch({ type: "UPDATE_FIELD", field: "socialInstagram", value })
            }
            placeholder="https://instagram.com/..."
          />
        </div>
      </div>
    </FormSection>
  );
}
