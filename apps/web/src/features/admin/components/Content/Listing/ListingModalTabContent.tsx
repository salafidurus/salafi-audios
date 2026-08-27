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

function TabError({
  activeTab,
  errorTabSet,
  formError,
}: {
  activeTab: string;
  errorTabSet: Set<string>;
  formError?: string | null;
}) {
  return (errorTabSet.has(activeTab) || activeTab === "general") && formError ? (
    <div className={styles.errorBanner}>{formError}</div>
  ) : null;
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
        <TabError activeTab={activeTab} errorTabSet={errorTabSet} formError={formError} />
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
        <TabError activeTab={activeTab} errorTabSet={errorTabSet} formError={formError} />
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
