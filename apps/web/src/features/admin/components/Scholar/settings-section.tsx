"use client";

import type { CreateScholarDto } from "@sd/core-contracts";
import { FormSection } from "@/features/admin/components/FormSection";
import { Toggle } from "@/shared/components/Toggle";
import { InputField } from "@/shared/components/InputField";
import { useTranslation } from "@/core/i18n/use-translation";
import type { FormAction } from "../../hooks/Scholar/useScholarForm";
import styles from "./scholar-modal.module.css";

interface SettingsSectionProps {
  formData: CreateScholarDto;
  dispatch: React.Dispatch<FormAction>;
}

export function SettingsSection({ formData, dispatch }: SettingsSectionProps) {
  const { t } = useTranslation();

  return (
    <FormSection title={t("admin.scholars.settings", "Settings")}>
      <div className={styles.checkboxGroup}>
        <label className={styles.checkbox}>
          <span>{t("admin.scholars.activeLabel", "Active")}</span>
          <Toggle
            checked={formData.isActive ?? true}
            onChange={(checked) =>
              dispatch({ type: "UPDATE_FIELD", field: "isActive", value: checked })
            }
            aria-label="Active"
          />
        </label>
      </div>

      <div className={styles.field}>
        <label htmlFor="scholar-order" className={styles.label}>
          {t("admin.scholars.orderIndexLabel", "Order Index")}
        </label>
        <InputField
          id="scholar-order"
          type="number"
          value={String(formData.orderIndex ?? "")}
          onChange={(value) => {
            const parsed = value ? Number(value) : undefined;
            dispatch({
              type: "UPDATE_FIELD",
              field: "orderIndex",
              value: Number.isNaN(parsed) ? 999 : (parsed ?? 999),
            });
          }}
        />
      </div>
    </FormSection>
  );
}
