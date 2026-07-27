"use client";

import React from "react";
import type { Locale, ScholarListItemDto, TopicDetailDto, ListingRefDto } from "@sd/core-contracts";
import { Modal } from "@/shared/components/Modal";
import { ListingGeneralSection } from "./ListingGeneralSection";
import { ListingTranslatableFields } from "./ListingTranslatableFields";
import { ListingSublistingsTab } from "./ListingSublistingsTab";
import { ListingReviewSection } from "./ListingReviewSection";
import type { FormAction, FormState } from "@/features/admin/hooks/Content/useListingForm";
import styles from "./listing-modal.module.css";

interface ListingModalTabContentProps {
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  activeTab: string;
  errorTabSet: Set<string>;
  scholars: ScholarListItemDto[];
  topics: TopicDetailDto[];
  series: ListingRefDto[];
  handleTopicToggle: (topicId: string) => void;
  handleTitleChange?: (val: string) => void;
  mainLocale: Locale;
  isEditing?: boolean;
  onImageStaged?: (file: File | null, preview: string | null) => void;
  stagedImagePreview?: string | null;
  showSublistingsTab?: boolean;
}

export function ListingModalTabContent({
  state,
  dispatch,
  activeTab,
  errorTabSet,
  scholars,
  topics,
  series,
  handleTopicToggle,
  handleTitleChange,
  mainLocale,
  isEditing = false,
  onImageStaged,
  stagedImagePreview,
  showSublistingsTab = false,
}: ListingModalTabContentProps) {
  const { formError } = state;

  return (
    <Modal.Content>
      <Modal.ContentItem id="general">
        {(errorTabSet.has("general") || activeTab === "general") && formError && (
          <div className={styles.errorBanner}>{formError}</div>
        )}
        <ListingGeneralSection
          state={state}
          dispatch={dispatch}
          scholars={scholars}
          topics={topics}
          series={series}
          handleTopicToggle={handleTopicToggle}
          isEditing={isEditing}
          onImageStaged={onImageStaged}
          stagedImagePreview={stagedImagePreview}
        />
      </Modal.ContentItem>

      <Modal.ContentItem id="main">
        {(errorTabSet.has("main") || activeTab === "main") && formError && (
          <div className={styles.errorBanner}>{formError}</div>
        )}
        <ListingTranslatableFields
          state={state}
          dispatch={dispatch}
          handleTitleChange={
            handleTitleChange ||
            ((v) => dispatch({ type: "UPDATE_FIELD", field: "title", value: v }))
          }
        />
      </Modal.ContentItem>

      {showSublistingsTab && state.id && (
        <Modal.ContentItem id="sublistings">
          <ListingSublistingsTab rootListingId={state.id} />
        </Modal.ContentItem>
      )}

      <Modal.ContentItem id="review">
        {formError && <div className={styles.errorBanner}>{formError}</div>}
        <ListingReviewSection state={state} mainLocale={mainLocale} topics={topics} />
      </Modal.ContentItem>
    </Modal.Content>
  );
}
