"use client";

import type { CreateScholarDto } from "@sd/core-contracts";
import { FormSection } from "@/features/admin/components/FormSection";
import type { FormAction } from "./ScholarModal";
import styles from "./scholar-modal.module.css";

interface SettingsSectionProps {
  formData: CreateScholarDto;
  dispatch: React.Dispatch<FormAction>;
}

export function SettingsSection({ formData, dispatch }: SettingsSectionProps) {
  return (
    <FormSection title="Settings">
      <div className={styles.checkboxGroup}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={formData.isKibar ?? false}
            onChange={(e) =>
              dispatch({ type: "UPDATE_FIELD", field: "isKibar", value: e.target.checked })
            }
          />
          <span>Kibar Scholar</span>
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={formData.isFeatured ?? false}
            onChange={(e) =>
              dispatch({ type: "UPDATE_FIELD", field: "isFeatured", value: e.target.checked })
            }
          />
          <span>Featured</span>
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={formData.isActive ?? true}
            onChange={(e) =>
              dispatch({ type: "UPDATE_FIELD", field: "isActive", value: e.target.checked })
            }
          />
          <span>Active</span>
        </label>
      </div>
    </FormSection>
  );
}
