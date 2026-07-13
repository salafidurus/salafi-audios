"use client";

import type { CreateScholarDto } from "@sd/core-contracts";
import { COUNTRY_LIST } from "@sd/core-contracts";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/Dropdown";
import { FormSection } from "@/features/admin/components/FormSection";
import type { FormAction } from "./ScholarModal";
import styles from "./scholar-modal.module.css";

interface LocationSectionProps {
  formData: CreateScholarDto;
  dispatch: React.Dispatch<FormAction>;
}

export function LocationSection({ formData, dispatch }: LocationSectionProps) {
  return (
    <FormSection title="Location & Language">
      <div className={styles.twoCol}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="scholar-country">
            Country
          </label>
          <Dropdown
            value={formData.country ?? ""}
            onValueChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "country", value })}
          >
            <DropdownTrigger id="scholar-country" placeholder="Select Country" />
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
            Main Language
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
            <DropdownTrigger id="scholar-language" placeholder="Select Language" />
            <DropdownContent>
              <DropdownItem value="en">English</DropdownItem>
              <DropdownItem value="ar">Arabic (عربي)</DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      </div>
    </FormSection>
  );
}
