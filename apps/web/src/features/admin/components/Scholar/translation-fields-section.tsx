"use client";

import { InputField } from "@/shared/components/InputField";
import { FormSection } from "@/features/admin/components/FormSection";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./translation-fields-section.module.css";

interface TranslationFieldsSectionProps {
  locale: "en" | "ar";
  name: string;
  bio?: string;
  onNameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  title?: string;
  isRequired?: boolean;
}

export function TranslationFieldsSection({
  locale,
  name,
  bio,
  onNameChange,
  onBioChange,
  title,
  isRequired,
}: TranslationFieldsSectionProps) {
  const { t } = useTranslation();

  const localeName = locale === "en" ? "English" : "العربية";
  const sectionTitle = title ?? t("admin.scholars.translation", `Translation (${localeName})`);

  return (
    <FormSection title={sectionTitle}>
      <div className={styles.container}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`scholar-name-${locale}`}>
            {t("admin.scholars.nameLabel", "Name")}
            {isRequired ? " *" : ""}
          </label>
          <InputField
            id={`scholar-name-${locale}`}
            type="text"
            value={name}
            onChange={onNameChange}
            placeholder={t("admin.scholars.namePlaceholder", "Scholar name")}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={`scholar-bio-${locale}`}>
            {t("admin.scholars.bioLabel", "Bio")}
          </label>
          <InputField
            id={`scholar-bio-${locale}`}
            type="textarea"
            value={bio ?? ""}
            onChange={onBioChange}
            placeholder={t("admin.scholars.bioPlaceholder", "Scholar biography")}
          />
        </div>
      </div>
    </FormSection>
  );
}
