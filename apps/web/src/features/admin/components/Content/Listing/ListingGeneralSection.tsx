"use client";

import React from "react";
import type { ScholarListItemDto, TopicDetailDto, ListingRefDto } from "@sd/core-contracts";
import { getLocalizedName } from "@sd/core-i18n";
import { validateLectureStatus } from "@/shared/types/form-types";
import { useTranslation } from "@/core/i18n/use-translation";
import { Search } from "@/shared/components/Search";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/Dropdown";
import type { FormState, FormAction, Locale } from "@/features/admin/hooks/Content/useListingForm";
import styles from "./listing-modal.module.css";

interface ListingGeneralSectionProps {
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  scholars: ScholarListItemDto[];
  topics: TopicDetailDto[];
  series: ListingRefDto[];
  handleTopicToggle: (topicId: string) => void;
}

export function ListingGeneralSection({
  state,
  dispatch,
  scholars,
  topics,
  series,
  handleTopicToggle,
}: ListingGeneralSectionProps) {
  const { i18n, t } = useTranslation();
  const { scholarId, seriesId, status, orderIndex, selectedTopics, language, formError } = state;

  return (
    <>
      {formError && <div className={styles.errorBanner}>{formError}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="lecture-language" className={styles.label}>
          {t("admin.contents.listing.languageLabel", "Language")}
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
            {t("admin.contents.listing.scholarLabel", "Scholar")}
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
          <label htmlFor="lecture-series" className={styles.label}>
            {t("admin.contents.listing.seriesLabel", "Series")}
          </label>
          <Dropdown
            value={seriesId}
            onValueChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "seriesId", value })}
          >
            <DropdownTrigger
              id="lecture-series"
              placeholder={t(
                "admin.contents.listing.seriesPlaceholder",
                "Select Series (Optional)",
              )}
              testId="series-dropdown"
            />
            <DropdownContent searchable>
              {series.map((s) => (
                <DropdownItem key={s.id} value={s.id}>
                  {s.title}
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>
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
          <input
            id="lecture-order"
            type="number"
            className={styles.input}
            value={orderIndex ?? ""}
            onChange={(e) => {
              const value = e.target.value;
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
        <span className={styles.label}>{t("admin.contents.listing.topicsLabel", "Topics")}</span>
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
