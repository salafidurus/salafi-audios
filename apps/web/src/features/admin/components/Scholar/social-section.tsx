"use client";

import Image from "next/image";
import type { CreateScholarDto } from "@sd/core-contracts";
import { InputField } from "@/shared/components/InputField";
import { FormSection } from "@/features/admin/components/FormSection";
import { useTranslation } from "@/core/i18n/use-translation";
import type { FormAction } from "../../hooks/Scholar/useScholarForm";
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
                <Image
                  src={field.icon}
                  alt={field.defaultLabel}
                  width={24}
                  height={24}
                  className={styles.iconOnly}
                />
              )}
              <div className={styles.inputWrapper}>
                <InputField
                  id={field.id}
                  type={field.prefix ? "text" : "url"}
                  value={field.prefix ? handle : value}
                  onChange={(newValue) => {
                    if (field.prefix) {
                      handleSocialChange(
                        field.key as keyof CreateScholarDto,
                        newValue,
                        field.prefix,
                      );
                    } else {
                      dispatch({
                        type: "UPDATE_FIELD",
                        field: field.key as keyof CreateScholarDto,
                        value: newValue,
                      });
                    }
                  }}
                  prefix={field.prefix}
                  placeholder={
                    field.prefix ? t("admin.scholars.handlePlaceholder", "username") : "https://..."
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </FormSection>
  );
}
