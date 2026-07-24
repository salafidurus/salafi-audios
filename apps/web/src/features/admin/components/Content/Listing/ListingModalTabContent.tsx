"use client";

import React from "react";
import type { Locale, ScholarListItemDto } from "@sd/core-contracts";
import { Modal } from "@/shared/components/Modal";
import { AudioUploader as AudioUploaderComponent } from "./AudioUploader/AudioUploader";
import { ListingGeneralSection } from "./ListingGeneralSection";
import { ListingTranslatableFields } from "./ListingTranslatableFields";
import { ListingReviewSection } from "./ListingReviewSection";
import { useTranslation } from "@/core/i18n/use-translation";
import type { FormState, FormAction } from "@/features/admin/hooks/Content/useListingForm";
import styles from "./listing-modal.module.css";

interface ListingModalTabContentProps {
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  activeTab: string;
  errorTabSet: Set<string>;
  scholars: ScholarListItemDto[];
  topics: any[];
  mode: "create" | "edit";
  listingId?: string;
  childCount?: number;
  onlyChildLessonCount?: number;
  handleTopicToggle: (topicId: string) => void;
  handleTitleChange: (val: string) => void;
  onAudioUploadComplete?: (audioData: any) => void;
  mainLocale: Locale;
  otherLocale: Locale;
}

export function ListingModalTabContent({
  state,
  dispatch,
  activeTab,
  errorTabSet,
  scholars,
  topics,
  mode,
  listingId,
  childCount,
  onlyChildLessonCount,
  handleTopicToggle,
  handleTitleChange,
  onAudioUploadComplete,
  mainLocale,
  otherLocale,
}: ListingModalTabContentProps) {
  const { t } = useTranslation();
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
          mode={mode}
          listingId={listingId}
          childCount={childCount}
          onlyChildLessonCount={onlyChildLessonCount}
          handleTopicToggle={handleTopicToggle}
        />
      </Modal.ContentItem>

      <Modal.ContentItem id="main">
        {(errorTabSet.has("main") || activeTab === "main") && formError && (
          <div className={styles.errorBanner}>{formError}</div>
        )}
        <ListingTranslatableFields
          state={state}
          dispatch={dispatch}
          locale={mainLocale}
          handleTitleChange={handleTitleChange}
        />
      </Modal.ContentItem>

      <Modal.ContentItem id="other">
        {(errorTabSet.has("other") || activeTab === "other") && formError && (
          <div className={styles.errorBanner}>{formError}</div>
        )}
        <ListingTranslatableFields
          state={state}
          dispatch={dispatch}
          locale={otherLocale}
          handleTitleChange={handleTitleChange}
        />
      </Modal.ContentItem>

      <Modal.ContentItem id="upload">
        {(errorTabSet.has("upload") || activeTab === "upload") && formError && (
          <div className={styles.errorBanner}>{formError}</div>
        )}
        <AudioUploaderComponent onUploadComplete={onAudioUploadComplete || (() => {})} />
      </Modal.ContentItem>

      <Modal.ContentItem id="arrange">
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--content-tertiary)" }}>
          {t("admin.contents.listing.arrangeComingSoon", "Coming soon")}
        </div>
      </Modal.ContentItem>

      <Modal.ContentItem id="review">
        {formError && <div className={styles.errorBanner}>{formError}</div>}
        <ListingReviewSection state={state} mainLocale={mainLocale} otherLocale={otherLocale} />
      </Modal.ContentItem>
    </Modal.Content>
  );
}
