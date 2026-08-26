"use client";

import type { Locale, ScholarListItemDto, TopicDetailDto } from "@sd/core-contracts";

import React from "react";

import type { FormAction, FormState } from "@/features/admin/hooks/Content/useListingForm";

import styles from "./listing-modal.module.css";
import { ListingGeneralSection } from "./ListingGeneralSection";
import { ListingReviewSection } from "./ListingReviewSection";
import { ListingSublistingsTab } from "./ListingSublistingsTab";
import { ListingTranslatableFields } from "./ListingTranslatableFields";

interface ListingModalTabContentProps {
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  activeTab: string;
  errorTabSet: Set<string>;
  scholars: ScholarListItemDto[];
  topics: TopicDetailDto[];
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
  handleTopicToggle,
  handleTitleChange,
  mainLocale,
  isEditing = false,
  onImageStaged,
  stagedImagePreview,
  showSublistingsTab = false,
}: ListingModalTabContentProps) {
  const { formError } = state;

  if (activeTab === "general") {
    return (
      <>
        {(errorTabSet.has("general") || activeTab === "general") && formError && (
          <div className={styles.errorBanner}>{formError}</div>
        )}
        <ListingGeneralSection
          state={state}
          dispatch={dispatch}
          scholars={scholars}
          topics={topics}
          handleTopicToggle={handleTopicToggle}
          isEditing={isEditing}
          onImageStaged={onImageStaged}
          stagedImagePreview={stagedImagePreview}
        />
      </>
    );
  }

  if (activeTab === "main") {
    return (
      <>
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
      </>
    );
  }

  if (activeTab === "sublistings" && showSublistingsTab && state.id) {
    return <ListingSublistingsTab rootListingId={state.id} />;
  }

  return (
    <>
      {formError && <div className={styles.errorBanner}>{formError}</div>}
      <ListingReviewSection state={state} mainLocale={mainLocale} topics={topics} />
    </>
  );
}
