"use client";

import React from "react";
import type { ListingFormat } from "@sd/core-contracts";
import { useTranslation } from "@/core/i18n/use-translation";
import { useListingFormatTransition } from "@/features/admin/hooks/Content/useListingFormatTransition";
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
  listingId?: string;
  onFormatChange?: (format: ListingFormat) => void;
}

export function ListingFormatField({
  mode,
  format,
  listingId,
  onFormatChange,
}: ListingFormatFieldProps) {
  const { t } = useTranslation();
  const { data: transitionInfo } = useListingFormatTransition(
    mode === "edit" ? listingId : undefined,
  );

  const isLoading = mode === "edit" && !transitionInfo;

  const getEligibleFormats = (): ListingFormat[] => {
    if (mode === "create") {
      return ["single", "series", "collection"];
    }

    if (!transitionInfo) return [format];

    const eligible: ListingFormat[] = [format];
    if (transitionInfo.canPromote) {
      eligible.push(format === "single" ? "series" : "collection");
    }
    for (const opt of transitionInfo.demoteOptions) {
      if (opt.allowed) {
        eligible.push(opt.target as ListingFormat);
      }
    }
    return eligible;
  };

  const eligibleFormats = getEligibleFormats();

  return (
    <div className={styles.formGroup}>
      <label htmlFor="format-dropdown" className={styles.label}>
        {t("admin.contents.listing.formatLabel", "Format")} *
      </label>
      {isLoading ? (
        <div>{t("admin.loading", "Loading...")}</div>
      ) : (
        <Dropdown
          value={format}
          onValueChange={(value) => onFormatChange?.(value as ListingFormat)}
        >
          <DropdownTrigger
            id="format-dropdown"
            placeholder={t("admin.contents.listing.formatPlaceholder", "Select Format")}
            disabled={mode === "edit"}
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
      )}
    </div>
  );
}
