/** Client-side status and ordering controls for a listing editor. */
"use client";

import React from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/ui/dropdown";
import { InputField } from "@/shared/components/ui/input-field";
import { validateLectureStatus, type LectureStatus } from "@/shared/types/form-types";

import styles from "./listing-modal.module.css";

/** Values and handlers needed to edit a listing's status and order. */
interface ListingStatusOrderFieldsProps {
  /** Current API-valid publication status. */
  status: LectureStatus;
  orderIndex: number;
  /** Persists a newly selected publication status in the parent form. */
  onStatusChange: (status: LectureStatus) => void;
  onOrderIndexChange: (orderIndex: number) => void;
  idPrefix?: string;
}

/** Renders the status selector and numeric order field for a listing. */
export function ListingStatusOrderFields({
  status,
  orderIndex,
  onStatusChange,
  onOrderIndexChange,
  idPrefix = "lecture",
}: ListingStatusOrderFieldsProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.formRow}>
      <div className={styles.formGroup}>
        <label htmlFor={`${idPrefix}-status`} className={styles.label}>
          {t("admin.contents.listing.statusLabel", "Status")}
        </label>
        <Dropdown
          value={status}
          onValueChange={(value) => onStatusChange(validateLectureStatus(value))}
        >
          <DropdownTrigger
            id={`${idPrefix}-status`}
            placeholder={t("admin.contents.listing.statusPlaceholder", "Select Status")}
            testId="status-dropdown"
          />
          <DropdownContent>
            <DropdownItem value="draft">{t("admin.contents.listing.draft", "Draft")}</DropdownItem>
            <DropdownItem value="review">
              {t("admin.contents.listing.review", "In Review")}
            </DropdownItem>
            <DropdownItem value="published">
              {t("admin.contents.listing.published", "Published")}
            </DropdownItem>
            <DropdownItem value="archived">
              {t("admin.contents.listing.archived", "Archived")}
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor={`${idPrefix}-order`} className={styles.label}>
          {t("admin.contents.listing.orderIndexLabel", "Order Index")}
        </label>
        <InputField
          id={`${idPrefix}-order`}
          type="number"
          value={String(orderIndex ?? "")}
          onChange={(value) => {
            const parsed = value ? Number(value) : undefined;
            onOrderIndexChange(Number.isNaN(parsed) ? 0 : (parsed ?? 0));
          }}
        />
      </div>
    </div>
  );
}
