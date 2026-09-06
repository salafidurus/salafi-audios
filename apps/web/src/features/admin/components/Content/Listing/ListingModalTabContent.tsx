/** Documents this module's responsibility and public boundary. */
"use client";

import type { Locale, ScholarListItemDto, TopicDetailDto } from "@sd/core-contracts";

import React from "react";

import type { FormAction, FormState } from "@/features/admin/hooks/Content/useListingForm";

import { FormErrorBanner } from "./FormErrorBanner";
import { ListingGeneralSection } from "./ListingGeneralSection";
import { ListingReviewSection } from "./ListingReviewSection";
import { ListingSublistingsTab } from "./ListingSublistingsTab";
import { ListingTranslatableFields } from "./ListingTranslatableFields";

interface ListingModalTabContentProps {
  /** Current listing form values and validation state. */
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  activeTab: string;
  /** Tabs whose fields currently contain validation errors. */
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

function GeneralTabContent({
  state,
  dispatch,
  error,
  scholars,
  topics,
  handleTopicToggle,
  isEditing,
  onImageStaged,
  stagedImagePreview,
}: Pick<
  ListingModalTabContentProps,
  | "state"
  | "dispatch"
  | "scholars"
  | "topics"
  | "handleTopicToggle"
  | "isEditing"
  | "onImageStaged"
  | "stagedImagePreview"
> & { /** Form-level error rendered above the general fields. */ error: string | null }) {
  return (
    <>
      <FormErrorBanner error={error} />
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

function MainTabContent({
  state,
  dispatch,
  error,
  errorTabSet,
  handleTitleChange,
}: Pick<ListingModalTabContentProps, "state" | "dispatch" | "errorTabSet" | "handleTitleChange"> & {
  /** Form-level error rendered when the main tab is active. */
  error: string | null;
}) {
  return (
    <>
      {errorTabSet.has("main") && <FormErrorBanner error={error} />}
      <ListingTranslatableFields
        state={state}
        dispatch={dispatch}
        handleTitleChange={
          handleTitleChange || ((v) => dispatch({ type: "UPDATE_FIELD", field: "title", value: v }))
        }
      />
    </>
  );
}

function shouldShowSublistings(
  activeTab: string,
  showSublistingsTab: boolean,
  listingId?: string,
): listingId is string {
  return activeTab === "sublistings" && showSublistingsTab && Boolean(listingId);
}

/** Renders the active listing-editor tab and its validation feedback. */
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
      <GeneralTabContent
        state={state}
        dispatch={dispatch}
        error={formError}
        scholars={scholars}
        topics={topics}
        handleTopicToggle={handleTopicToggle}
        isEditing={isEditing}
        onImageStaged={onImageStaged}
        stagedImagePreview={stagedImagePreview}
      />
    );
  }

  if (activeTab === "main") {
    return (
      <MainTabContent
        state={state}
        dispatch={dispatch}
        error={formError}
        errorTabSet={errorTabSet}
        handleTitleChange={handleTitleChange}
      />
    );
  }

  if (shouldShowSublistings(activeTab, showSublistingsTab, state.id)) {
    return <ListingSublistingsTab rootListingId={state.id} />;
  }

  return (
    <>
      <FormErrorBanner error={formError} />
      <ListingReviewSection state={state} mainLocale={mainLocale} topics={topics} />
    </>
  );
}
