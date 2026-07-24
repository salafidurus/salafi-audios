"use client";

import React from "react";
import type { ListingFormat } from "@sd/core-contracts";
import { useTranslation } from "@/core/i18n/use-translation";
import { useEligibleFormats } from "@/features/admin/hooks/Content/useEligibleFormats";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/Dropdown";
import styles from "./listing-modal.module.css";

interface ListingFormatFieldProps {
  mode: "create" | "edit";
  format: ListingFormat;
  childCount?: number;
  onlyChildLessonCount?: number;
  onFormatChange?: (format: ListingFormat) => void;
}

export function ListingFormatField({
  mode,
  format,
  childCount = 0,
  onlyChildLessonCount = 0,
  onFormatChange,
}: ListingFormatFieldProps) {
  const { t } = useTranslation();
  const eligibleFormats = useEligibleFormats(format, mode, childCount, onlyChildLessonCount);

  return (
    <div className={styles.formGroup}>
      <label htmlFor="format-dropdown" className={styles.label}>
        {t("admin.contents.listing.formatLabel", "Format")} *
      </label>
      <Dropdown value={format} onValueChange={(value) => onFormatChange?.(value as ListingFormat)}>
        <DropdownTrigger
          id="format-dropdown"
          placeholder={t("admin.contents.listing.formatPlaceholder", "Select Format")}
        />
        <DropdownContent>
          {eligibleFormats.includes("single") && (
            <DropdownItem value="single">
              {t("admin.contents.listing.single", "Single")}
            </DropdownItem>
          )}
          {eligibleFormats.includes("series") && (
            <DropdownItem value="series">
              {t("admin.contents.listing.series", "Series")}
            </DropdownItem>
          )}
          {eligibleFormats.includes("collection") && (
            <DropdownItem value="collection">
              {t("admin.contents.listing.collection", "Collection")}
            </DropdownItem>
          )}
        </DropdownContent>
      </Dropdown>
    </div>
  );
}
