"use client";

import React from "react";
import type { ScholarListItemDto, TopicDetailDto, Locale } from "@sd/core-contracts";
import { getLocalizedName } from "@sd/core-i18n";
import { validateLectureStatus } from "@/shared/types/form-types";
import { InputField } from "@/shared/components/InputField";
import { useTranslation } from "@/core/i18n/use-translation";
import { Search } from "@/shared/components/Search";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/Dropdown";
import type { FormState, FormAction } from "@/features/admin/hooks/Content/useListingForm";
import { ListingFormatField } from "./ListingFormatField";
import styles from "./listing-modal.module.css";

interface ListingGeneralSectionProps {
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  scholars: ScholarListItemDto[];
  topics: TopicDetailDto[];
  mode: "create" | "edit";
  listingId?: string;
  onTransitioned?: () => void;
  handleTopicToggle: (topicId: string) => void;
}

export function ListingGeneralSection({
  state,
  dispatch,
  scholars,
  topics,
  mode,
  listingId,
  onTransitioned,
  handleTopicToggle,
}: ListingGeneralSectionProps) {
  const { i18n, t } = useTranslation();
  const { scholarId, format, status, orderIndex, selectedTopics, language, formError } = state;

  return (
    <>
      {formError && <div className={styles.errorBanner}>{formError}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="lecture-language" className={styles.label}>
          {t("admin.contents.listing.languageLabel", "Language")} *
        </label>
        <Dropdown
          value={language}
          onValueChange={(value) =>
            dispatch({ type: "UPDATE_FIELD", field: "language", value: value as Locale })
          }
        >
          <DropdownTrigger id="lecture-language" />
          <DropdownContent>
            <DropdownItem value="ar">العربية</DropdownItem>
            <DropdownItem value="en">English</DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="lecture-scholar" className={styles.label}>
            {t("admin.contents.listing.scholarLabel", "Scholar")} *
          </label>
          <Dropdown
            value={scholarId}
            onValueChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "scholarId", value })}
          >
            <DropdownTrigger
              id="lecture-scholar"
              placeholder={t("admin.contents.listing.scholarPlaceholder", "Select Scholar")}
              testId="scholar-dropdown"
            />
            <DropdownContent searchable>
              {scholars.map((s) => (
                <DropdownItem key={s.id} value={s.id}>
                  {s.name}
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>
        </div>

        <div className={styles.formGroup}>
          <ListingFormatField
            mode={mode}
            format={format}
            listingId={listingId}
            onCreateFormatChange={(newFormat) =>
              dispatch({ type: "UPDATE_FIELD", field: "format", value: newFormat })
            }
            onTransitioned={onTransitioned}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="lecture-status" className={styles.label}>
            {t("admin.contents.listing.statusLabel", "Status")}
          </label>
          <Dropdown
            value={status}
            onValueChange={(value) =>
              dispatch({
                type: "UPDATE_FIELD",
                field: "status",
                value: validateLectureStatus(value),
              })
            }
          >
            <DropdownTrigger
              id="lecture-status"
              placeholder={t("admin.contents.listing.statusPlaceholder", "Select Status")}
              testId="status-dropdown"
            />
            <DropdownContent>
              <DropdownItem value="draft">
                {t("admin.contents.listing.draft", "Draft")}
              </DropdownItem>
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
          <label htmlFor="lecture-order" className={styles.label}>
            {t("admin.contents.listing.orderIndexLabel", "Order Index")}
          </label>
          <InputField
            id="lecture-order"
            type="number"
            value={String(orderIndex ?? "")}
            onChange={(value) => {
              const parsed = value ? Number(value) : undefined;
              dispatch({
                type: "UPDATE_FIELD",
                field: "orderIndex",
                value: Number.isNaN(parsed) ? 0 : (parsed ?? 0),
              });
            }}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <span className={styles.label}>{t("admin.contents.listing.topicsLabel", "Topics")} *</span>
        {topics.length > 0 ? (
          <Search.Filter
            chips={topics.map((t) => ({
              id: t.id,
              label: getLocalizedName(t.name, i18n.language),
            }))}
            selected={selectedTopics}
            onChipChange={handleTopicToggle}
            multiple
            includeAllOption={false}
          />
        ) : (
          <span className={styles.noData}>
            {t("admin.contents.listing.noTopicsAvailable", "No topics available")}
          </span>
        )}
      </div>
    </>
  );
}
