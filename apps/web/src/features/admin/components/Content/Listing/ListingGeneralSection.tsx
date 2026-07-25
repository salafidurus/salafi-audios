"use client";

import React from "react";
import type { ScholarListItemDto, TopicDetailDto, ListingRefDto, Locale } from "@sd/core-contracts";
import { getLocalizedName, SUPPORTED_LOCALES } from "@sd/core-i18n";
import { getLocaleLabel } from "@/features/admin/utils/locale-tabs";
import { validateLectureStatus } from "@/shared/types/form-types";
import { InputField } from "@/shared/components/InputField";
import { ImageUploadEditor } from "@/shared/components/ImageUploadEditor";
import { useTranslation } from "@/core/i18n/use-translation";
import { Search } from "@/shared/components/Search";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/Dropdown";
import type { FormAction, FormState } from "@/features/admin/hooks/Content/useListingForm";
import styles from "./listing-modal.module.css";

interface ListingGeneralSectionProps {
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  scholars: ScholarListItemDto[];
  topics: TopicDetailDto[];
  series: ListingRefDto[];
  handleTopicToggle: (topicId: string) => void;
  isEditing?: boolean;
  onImageStaged?: (file: File | null, preview: string | null) => void;
  stagedImagePreview?: string | null;
}

export function ListingGeneralSection({
  state,
  dispatch,
  scholars,
  topics,
  series,
  handleTopicToggle,
  isEditing = false,
  onImageStaged,
  stagedImagePreview,
}: ListingGeneralSectionProps) {
  const { i18n, t } = useTranslation();
  const { scholarId, status, orderIndex, selectedTopics, language, formError, slug, format } =
    state;

  return (
    <>
      {formError && <div className={styles.errorBanner}>{formError}</div>}

      <div className={styles.container}>
        {onImageStaged && (
          <div className={styles.imageColumn}>
            <ImageUploadEditor
              imageUrl={stagedImagePreview || state.coverImageUrl}
              onImageStaged={onImageStaged}
              uploadLabel={t("admin.contents.listing.uploadCover", "Upload cover")}
              changeLabel={t("admin.contents.listing.changeCover", "Change cover")}
              selectLabel={t("admin.contents.listing.selectCover", "Select cover image")}
              altText={t("admin.contents.listing.coverImageAlt", "Listing cover image")}
            />
          </div>
        )}

        <div className={styles.fieldsColumn}>
          <div className={styles.formGroup}>
            <label htmlFor="lecture-slug" className={styles.label}>
              {t("admin.contents.listing.slugLabel", "Slug")} *
            </label>
            <InputField
              id="lecture-slug"
              type="text"
              value={slug}
              onChange={(value) => {
                if (!isEditing) {
                  dispatch({ type: "UPDATE_FIELD", field: "slug", value });
                }
              }}
              placeholder={t("admin.contents.listing.slugPlaceholder", "listing-slug")}
              disabled={isEditing}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lecture-scholar" className={styles.label}>
              {t("admin.contents.listing.scholarLabel", "Scholar")} *
            </label>
            <Dropdown
              value={scholarId}
              onValueChange={(value) =>
                dispatch({ type: "UPDATE_FIELD", field: "scholarId", value })
              }
              disabled={isEditing}
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
        </div>
      </div>

      <div className={styles.formRow}>
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
              {SUPPORTED_LOCALES.map((locale) => (
                <DropdownItem key={locale} value={locale}>
                  {getLocaleLabel(locale)}
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="lecture-format" className={styles.label}>
            {t("admin.contents.listing.formatLabel", "Format")} *
          </label>
          <Dropdown
            value={format}
            onValueChange={(value) =>
              dispatch({
                type: "UPDATE_FIELD",
                field: "format",
                value: value as "single" | "series" | "collection",
              })
            }
            disabled={isEditing}
          >
            <DropdownTrigger id="lecture-format" testId="format-dropdown" />
            <DropdownContent>
              <DropdownItem value="single">
                {t("admin.contents.listing.single", "Single")}
              </DropdownItem>
              <DropdownItem value="series">
                {t("admin.contents.listing.series", "Series")}
              </DropdownItem>
              <DropdownItem value="collection">
                {t("admin.contents.listing.collection", "Collection")}
              </DropdownItem>
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
