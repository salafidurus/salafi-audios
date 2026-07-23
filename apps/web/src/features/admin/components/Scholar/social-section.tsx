"use client";

import type { CreateScholarDto } from "@sd/core-contracts";
import { EditableInput } from "@/shared/components/EditableInput";
import { FormSection } from "@/features/admin/components/FormSection";
import { useTranslation } from "@/core/i18n/use-translation";
import type { FormAction } from "./ScholarModal";
import styles from "./social-section.module.css";

interface SocialSectionProps {
  formData: CreateScholarDto;
  dispatch: React.Dispatch<FormAction>;
}

const SOCIAL_FIELDS = [
  {
    key: "socialTwitter",
    label: "admin.scholars.twitterLabel",
    defaultLabel: "X (Twitter)",
    prefix: "https://x.com/",
    id: "scholar-twitter",
    icon: "/social-icons/x-light.svg",
  },
  {
    key: "socialTelegram",
    label: "admin.scholars.telegramLabel",
    defaultLabel: "Telegram",
    prefix: "https://t.me/",
    id: "scholar-telegram",
    icon: "/social-icons/telegram-light.svg",
  },
  {
    key: "socialYoutube",
    label: "admin.scholars.youtubeLabel",
    defaultLabel: "YouTube",
    prefix: "https://youtube.com/@",
    id: "scholar-youtube",
    icon: "/social-icons/youtube-light.svg",
  },
  {
    key: "socialWebsite",
    label: "admin.scholars.websiteLabel",
    defaultLabel: "Website",
    prefix: null, // No fixed prefix for website
    id: "scholar-website",
    icon: null,
  },
];

function extractHandle(url: string, prefix: string | null): string {
  if (!prefix) return url;
  if (url.startsWith(prefix)) {
    return url.slice(prefix.length);
  }
  return url;
}

function reconstructUrl(handle: string, prefix: string | null): string {
  if (!prefix) return handle;
  return handle ? `${prefix}${handle}` : "";
}

export function SocialSection({ formData, dispatch }: SocialSectionProps) {
  const { t } = useTranslation();

  const handleSocialChange = (
    key: keyof CreateScholarDto,
    handle: string,
    prefix: string | null,
  ) => {
    const fullUrl = reconstructUrl(handle, prefix);
    dispatch({ type: "UPDATE_FIELD", field: key, value: fullUrl });
  };

  return (
    <FormSection title={t("admin.scholars.socialMedia", "Social Media")}>
      <div className={styles.fieldsGrid}>
        {SOCIAL_FIELDS.map((field) => {
          const value = (formData[field.key as keyof CreateScholarDto] as string) ?? "";
          const handle = extractHandle(value, field.prefix);

          return (
            <div key={field.key} className={styles.fieldWithIcon}>
              {field.icon && (
                <img src={field.icon} alt={field.defaultLabel} className={styles.iconOnly} />
              )}
              <div className={styles.inputWrapper}>
                {field.prefix ? (
                  <div className={styles.prefixedContainer}>
                    <div className={styles.prefixedInput}>
                      <span className={styles.prefix}>{field.prefix}</span>
                      <input
                        id={field.id}
                        type="text"
                        value={handle}
                        onChange={(e) =>
                          handleSocialChange(
                            field.key as keyof CreateScholarDto,
                            e.target.value,
                            field.prefix,
                          )
                        }
                        placeholder={t("admin.scholars.handlePlaceholder", "username")}
                        className={styles.input}
                      />
                    </div>
                  </div>
                ) : (
                  <EditableInput
                    id={field.id}
                    type="url"
                    value={value}
                    onChange={(newValue) =>
                      dispatch({
                        type: "UPDATE_FIELD",
                        field: field.key as keyof CreateScholarDto,
                        value: newValue,
                      })
                    }
                    placeholder="https://..."
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </FormSection>
  );
}
