"use client";

import { type CreateScholarDto, COUNTRY_LIST } from "@sd/core-contracts";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/Dropdown";
import { FormSection } from "@/features/admin/components/FormSection";
import { useTranslation } from "@/core/i18n/use-translation";
import type { FormAction } from "../../hooks/Scholar/useScholarForm";
import styles from "./scholar-modal.module.css";

interface LocationSectionProps {
  formData: CreateScholarDto;
  dispatch: React.Dispatch<FormAction>;
}

export function LocationSection({ formData, dispatch }: LocationSectionProps) {
  const { t } = useTranslation();

  return (
    <FormSection title={t("admin.scholars.locationLanguage", "Location & Language")}>
      <div className={styles.twoCol}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="scholar-country">
            {t("admin.scholars.countryLabel", "Country")}
          </label>
          <Dropdown
            value={formData.country ?? ""}
            onValueChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "country", value })}
          >
            <DropdownTrigger
              id="scholar-country"
              placeholder={t("admin.scholars.countryPlaceholder", "Select Country")}
            />
            <DropdownContent searchable>
              {COUNTRY_LIST.map((c) => (
                <DropdownItem key={c.code} value={c.code}>
                  {c.name}
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="scholar-language">
            {t("admin.scholars.languageLabel", "Main Language")} *
          </label>
          <Dropdown
            value={formData.mainLanguage}
            onValueChange={(value) =>
              dispatch({
                type: "UPDATE_FIELD",
                field: "mainLanguage",
                value: value as "en" | "ar",
              })
            }
          >
            <DropdownTrigger
              id="scholar-language"
              placeholder={t("admin.scholars.languagePlaceholder", "Select Language")}
            />
            <DropdownContent>
              <DropdownItem value="en">{t("common.english", "English")}</DropdownItem>
              <DropdownItem value="ar">{t("common.arabic", "Arabic (عربي)")}</DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      </div>
    </FormSection>
  );
}
