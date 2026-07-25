"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/shared/components/Modal";
import { useTranslation } from "@/core/i18n/use-translation";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { AudioUploader } from "./AudioUploader/AudioUploader";
import { ListingUploadArrangeReviewSection } from "./ListingUploadArrangeReviewSection";
import { fetchListingFormData, updateLecture } from "@/features/admin/api/admin-lectures.api";
import styles from "./listing-modal.module.css";

interface AudioData {
  audioKey: string;
  durationSeconds: number;
  sizeBytes: number;
  format: string;
  filename: string;
}

interface ListingUploadArrangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  listingId?: string | null;
}

export function ListingUploadArrangeModal({
  isOpen,
  onClose,
  onSuccess,
  listingId,
}: ListingUploadArrangeModalProps) {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const [activeTab, setActiveTab] = useState<"upload" | "arrange" | "review">("upload");
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [listingTitle, setListingTitle] = useState<string>("");
  const [currentAudioKey, setCurrentAudioKey] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setAudioData(null);
      setError(null);
      setActiveTab("upload");
      return;
    }

    if (listingId) {
      fetchListingFormData(listingId)
        .then((data) => {
          setListingTitle(data.listing.title);
          setCurrentAudioKey(data.listing.audioKey || "");
        })
        .catch(() => {});
    }
  }, [isOpen, listingId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingId) return;

    setSaving(true);
    setError(null);

    try {
      if (audioData) {
        await updateLecture(listingId, {
          audioKey: audioData.audioKey,
          durationSeconds: audioData.durationSeconds,
          sizeBytes: audioData.sizeBytes,
        });
      }
      await onSuccess();
      onClose();
    } catch (err) {
      setError(
        (err as Error)?.message ||
          t("admin.contents.listing.failedToSaveAudio", "Failed to update audio details."),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        listingId
          ? `${t("admin.contents.listing.uploadArrangeTitle", "Upload & Arrange")}${isDesktop && listingTitle ? ` (${listingTitle})` : ""}`
          : t("admin.contents.listing.uploadArrangeTitle", "Upload & Arrange")
      }
      size="xl"
      width="wide"
      height="long"
      multiTab
      requireReview
      activeTab={activeTab}
      onActiveTabChange={(id) => setActiveTab(id as typeof activeTab)}
      defaultActiveTab="upload"
      saveFormId="listing-upload-arrange-form"
      saving={saving}
      reviewTabId="review"
    >
      <form id="listing-upload-arrange-form" onSubmit={handleSave} className={styles.form}>
        <Modal.Tabs>
          <Modal.TabItem id="upload">
            {t("admin.contents.listing.uploadTab", "Upload Audio")}
          </Modal.TabItem>
          <Modal.TabItem id="arrange">
            {t("admin.contents.listing.arrangeTab", "Arrange")}
          </Modal.TabItem>
          <Modal.TabItem id="review">{t("admin.modal.reviewTab", "Review")}</Modal.TabItem>
        </Modal.Tabs>

        <Modal.Content>
          <Modal.ContentItem id="upload">
            {error && <div className={styles.errorBanner}>{error}</div>}
            <AudioUploader onUploadComplete={(data) => setAudioData(data)} />
          </Modal.ContentItem>

          <Modal.ContentItem id="arrange">
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--content-tertiary)" }}>
              {t("admin.contents.listing.arrangeComingSoon", "Coming soon")}
            </div>
          </Modal.ContentItem>

          <Modal.ContentItem id="review">
            {error && <div className={styles.errorBanner}>{error}</div>}
            <ListingUploadArrangeReviewSection
              listingTitle={listingTitle}
              audioData={audioData}
              currentAudioKey={currentAudioKey}
            />
          </Modal.ContentItem>
        </Modal.Content>
      </form>
    </Modal>
  );
}
