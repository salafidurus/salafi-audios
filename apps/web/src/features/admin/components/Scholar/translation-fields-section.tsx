"use client";

import type { CreateScholarDto } from "@sd/core-contracts";
import { EditableInput } from "@/shared/components/EditableInput";
import { FormSection } from "@/features/admin/components/FormSection";
import { useTranslation } from "@/core/i18n/use-translation";
import type { FormAction } from "./ScholarModal";
import styles from "./translation-fields-section.module.css";

interface TranslationFieldsSectionProps {
  locale: "en" | "ar";
  name: string;
  bio?: string;
  onNameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  title?: string;
}

export function TranslationFieldsSection({
  locale,
  name,
  bio,
  onNameChange,
  onBioChange,
  title,
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
          </label>
          <EditableInput
            id={`scholar-name-${locale}`}
            value={name}
            onChange={onNameChange}
            placeholder={t("admin.scholars.namePlaceholder", "Scholar name")}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={`scholar-bio-${locale}`}>
            {t("admin.scholars.bioLabel", "Bio")}
          </label>
          <textarea
            id={`scholar-bio-${locale}`}
            value={bio ?? ""}
            onChange={(e) => onBioChange(e.target.value)}
            placeholder={t("admin.scholars.bioPlaceholder", "Scholar biography")}
            className={styles.textarea}
          />
        </div>
      </div>
    </FormSection>
  );
}
