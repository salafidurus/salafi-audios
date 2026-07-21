"use client";

import type { CreateScholarDto } from "@sd/core-contracts";
import { FormSection } from "@/features/admin/components/FormSection";
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
          <input
            type="checkbox"
            checked={formData.isKibar ?? false}
            onChange={(e) =>
              dispatch({ type: "UPDATE_FIELD", field: "isKibar", value: e.target.checked })
            }
          />
          <span>{t("admin.scholars.kibarLabel", "Kibar Scholar")}</span>
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={formData.isFeatured ?? false}
            onChange={(e) =>
              dispatch({ type: "UPDATE_FIELD", field: "isFeatured", value: e.target.checked })
            }
          />
          <span>{t("admin.scholars.featuredLabel", "Featured")}</span>
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={formData.isActive ?? true}
            onChange={(e) =>
              dispatch({ type: "UPDATE_FIELD", field: "isActive", value: e.target.checked })
            }
          />
          <span>{t("admin.scholars.activeLabel", "Active")}</span>
        </label>
      </div>
    </FormSection>
  );
}
