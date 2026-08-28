/** Documents this module's responsibility and public boundary. */
"use client";

import type { ScholarListItemDto, TopicDetailDto, Locale } from "@sd/core-contracts";

import { getLocalizedName, SUPPORTED_LOCALES } from "@sd/core-i18n";
import React from "react";

import type { FormAction, FormState } from "@/features/admin/hooks/Content/useListingForm";

import { useTranslation } from "@/core/i18n/use-translation";
import { getLocaleLabel } from "@/features/admin/utils/locale-tabs";
import { deriveChildSlug } from "@/features/admin/utils/slugify";
import { ImageUploadEditor } from "@/shared/components/ImageUploadEditor";
import { Search } from "@/shared/components/Search";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/ui/dropdown";
import { InputField } from "@/shared/components/ui/input-field";
import { useFormatScholarName } from "@/shared/utils/format-scholar-name";

import styles from "./listing-modal.module.css";
import { ListingStatusOrderFields } from "./ListingStatusOrderFields";

interface ListingGeneralSectionProps {
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  scholars: ScholarListItemDto[];
  topics: TopicDetailDto[];

  handleTopicToggle: (topicId: string) => void;
  isEditing?: boolean;
  onImageStaged?: (file: File | null, preview: string | null) => void;
  stagedImagePreview?: string | null;
}

type ListingFieldProps = Pick<ListingGeneralSectionProps, "state" | "dispatch"> & {
  scholars: ScholarListItemDto[];
  isEditing: boolean;
};

function ListingSlugControl({
  isEditing,
  slug,
  slugSuffix,
  scholarSlug,
  scholarId,
  suffixIsEmpty,
  dispatch,
  t,
}: {
  isEditing: boolean;
  slug: string;
  slugSuffix: string;
  scholarSlug: string;
  scholarId?: string;
  suffixIsEmpty: boolean;
  dispatch: React.Dispatch<FormAction>;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  if (isEditing) {
    return <InputField id="lecture-slug" type="text" value={slug} onChange={() => {}} disabled />;
  }

  return (
    <>
      <div className={styles.slugPrefixGroup}>
        {scholarSlug && <span className={styles.slugPrefixBadge}>{scholarSlug}-</span>}
        <InputField
          id="lecture-slug"
          type="text"
          value={slugSuffix}
          onChange={(value) => {
            dispatch({ type: "UPDATE_FIELD", field: "slugSuffix", value });
            dispatch({
              type: "UPDATE_FIELD",
              field: "slug",
              value: scholarSlug ? deriveChildSlug(scholarSlug, value) : value,
            });
          }}
          placeholder={
            scholarSlug
              ? t("admin.contents.listing.slugSuffixPlaceholder", "bayquniyyah")
              : t("admin.contents.listing.slugSelectScholarFirst", "Select a scholar first")
          }
          disabled={!scholarId}
        />
      </div>
      {suffixIsEmpty && (
        <span className={styles.fieldError}>
          {t(
            "admin.contents.listing.slugSuffixRequired",
            "Enter a slug beyond the scholar prefix.",
          )}
        </span>
      )}
    </>
  );
}

function ListingSlugField({ state, dispatch, scholars, isEditing }: ListingFieldProps) {
  const { t } = useTranslation();
  const { scholarId, slug, slugSuffix } = state;
  const scholarSlug = scholars.find((scholar) => scholar.id === scholarId)?.slug ?? "";
  const suffixIsEmpty = !isEditing && Boolean(scholarId) && !slugSuffix.trim();

  return (
    <div className={styles.formGroup}>
      <label htmlFor="lecture-slug" className={styles.label}>
        {t("admin.contents.listing.slugLabel", "Slug")} *
      </label>
      <ListingSlugControl
        isEditing={isEditing}
        slug={slug}
        slugSuffix={slugSuffix}
        scholarSlug={scholarSlug}
        scholarId={scholarId}
        suffixIsEmpty={suffixIsEmpty}
        dispatch={dispatch}
        t={t}
      />
    </div>
  );
}

function ListingScholarField({ state, dispatch, scholars, isEditing }: ListingFieldProps) {
  const { t } = useTranslation();
  const formatScholarName = useFormatScholarName();
  const { scholarId, slugSuffix } = state;

  return (
    <div className={styles.formGroup}>
      <label htmlFor="lecture-scholar" className={styles.label}>
        {t("admin.contents.listing.scholarLabel", "Scholar")} *
      </label>
      <Dropdown
        value={scholarId}
        onValueChange={(value) => {
          dispatch({ type: "UPDATE_FIELD", field: "scholarId", value });
          if (!isEditing) {
            const newScholarSlug = scholars.find((scholar) => scholar.id === value)?.slug ?? "";
            dispatch({
              type: "UPDATE_FIELD",
              field: "slug",
              value: newScholarSlug ? deriveChildSlug(newScholarSlug, slugSuffix) : slugSuffix,
            });
          }
        }}
        disabled={isEditing}
      >
        <DropdownTrigger
          id="lecture-scholar"
          placeholder={t("admin.contents.listing.scholarPlaceholder", "Select Scholar")}
          testId="scholar-dropdown"
        />
        <DropdownContent searchable>
          {scholars.map((scholar) => (
            <DropdownItem key={scholar.id} value={scholar.id}>
              {formatScholarName(scholar)}
            </DropdownItem>
          ))}
        </DropdownContent>
      </Dropdown>
    </div>
  );
}

function ListingTopicsField({
  topics,
  selectedTopics,
  handleTopicToggle,
}: Pick<ListingGeneralSectionProps, "topics" | "handleTopicToggle"> & {
  selectedTopics: string[];
}) {
  const { t, i18n } = useTranslation();

  return (
    <div className={styles.formGroup}>
      <span className={styles.label}>{t("admin.contents.listing.topicsLabel", "Topics")} *</span>
      {topics.length > 0 ? (
        <Search.Filter
          chips={topics.map((topic) => ({
            id: topic.id,
            label: getLocalizedName(topic.name, i18n.language),
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
  );
}

export function ListingGeneralSection({
  state,
  dispatch,
  scholars,
  topics,
  handleTopicToggle,
  isEditing = false,
  onImageStaged,
  stagedImagePreview,
}: ListingGeneralSectionProps) {
  const { t } = useTranslation();
  const { status, orderIndex, selectedTopics, language, formError, format } = state;

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
            <ListingSlugField
              state={state}
              dispatch={dispatch}
              scholars={scholars}
              isEditing={isEditing}
            />
          </div>

          <div className={styles.formGroup}>
            <ListingScholarField
              state={state}
              dispatch={dispatch}
              scholars={scholars}
              isEditing={isEditing}
            />
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
              // SAFETY: the language dropdown renders only supported locale options below.
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
              // SAFETY: the format dropdown renders only the three listing format literals below.
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

      <ListingStatusOrderFields
        status={status}
        orderIndex={orderIndex}
        onStatusChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "status", value })}
        onOrderIndexChange={(value) =>
          dispatch({ type: "UPDATE_FIELD", field: "orderIndex", value })
        }
      />

      <ListingTopicsField
        topics={topics}
        selectedTopics={selectedTopics}
        handleTopicToggle={handleTopicToggle}
      />
    </>
  );
}
