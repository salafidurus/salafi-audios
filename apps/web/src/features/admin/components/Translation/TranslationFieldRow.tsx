"use client";

import { useTranslation } from "@/core/i18n/use-translation";
import { InputField } from "@/shared/components/ui/input-field";

import styles from "./translation-modal.module.css";

export interface TranslationFieldRowProps {
  id: string;
  label: string;
  sourceValue: string | null;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  required?: boolean;
}

export function TranslationFieldRow({
  id,
  label,
  sourceValue,
  value,
  onChange,
  multiline,
  required,
}: TranslationFieldRowProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.fieldRow}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
        {required ? " *" : ""}
      </label>
      <div className={styles.sourceValue}>
        {sourceValue || (
          <em>{t("admin.translations.emptySource", "No value in the main language")}</em>
        )}
      </div>
      <InputField
        id={id}
        type={multiline ? "textarea" : "text"}
        value={value}
        onChange={onChange}
        required={required}
        rows={multiline ? 3 : undefined}
      />
    </div>
  );
}
