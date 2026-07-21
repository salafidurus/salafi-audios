"use client";

import type { CreateScholarDto } from "@sd/core-contracts";
import { FormSection } from "@/features/admin/components/FormSection";
import { Toggle } from "@/shared/components/Toggle";
import { useTranslation } from "@/core/i18n/use-translation";
import type { FormAction } from "./ScholarModal";
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
          <span>{t("admin.scholars.kibarLabel", "Kibar Scholar")}</span>
          <Toggle
            checked={formData.isKibar ?? false}
            onChange={(checked) =>
              dispatch({ type: "UPDATE_FIELD", field: "isKibar", value: checked })
            }
            aria-label="Kibar Scholar"
          />
        </label>
        <label className={styles.checkbox}>
          <span>{t("admin.scholars.featuredLabel", "Featured")}</span>
          <Toggle
            checked={formData.isFeatured ?? false}
            onChange={(checked) =>
              dispatch({ type: "UPDATE_FIELD", field: "isFeatured", value: checked })
            }
            aria-label="Featured"
          />
        </label>
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
    </FormSection>
  );
}
