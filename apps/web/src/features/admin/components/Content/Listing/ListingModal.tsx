"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApiQuery, queryKeys, httpClient, endpoints, type Locale } from "@sd/core-contracts";
import type { ScholarListItemDto, AdminListingDetailDto } from "@sd/core-contracts";
import { useTopicsList } from "@sd/domain-search";
import { useTranslation } from "@/core/i18n/use-translation";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { Modal } from "@/shared/components/Modal";
import { AudioUploader as AudioUploaderComponent } from "./AudioUploader/AudioUploader";
import {
  createLecture,
  updateLecture,
  fetchListingFormData,
} from "@/features/admin/api/admin-lectures.api";
import { sanitizeError } from "@sd/utils-error";
import {
  getSecondaryLocales,
  buildTranslationsPayload,
  getLocaleLabel,
} from "@/features/admin/utils/locale-tabs";
import { SUPPORTED_LOCALES } from "@sd/core-contracts";
import { ListingGeneralSection } from "./ListingGeneralSection";
import { ListingTranslatableFields } from "./ListingTranslatableFields";
import { ListingReviewSection } from "./ListingReviewSection";
import { ListingModalTabContent } from "./ListingModalTabContent";
import { useListingForm } from "@/features/admin/hooks/Content/useListingForm";
import styles from "./listing-modal.module.css";

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  listingId?: string | null;
  initialAudioData?: {
    audioKey: string;
    durationSeconds: number;
    sizeBytes: number;
    format: string;
    filename: string;
  } | null;
  showAudioUploadTab?: boolean;
  onAudioUploadComplete?: (audioData: any) => void;
}

export function ListingModal({
  isOpen,
  onClose,
  onSuccess,
  listingId,
  initialAudioData,
  showAudioUploadTab,
  onAudioUploadComplete,
}: ListingModalProps) {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const loadingRef = useRef(false);
  const fetchErrorRef = useRef<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "general" | "main" | "other" | "upload" | "arrange" | "review"
  >(showAudioUploadTab && !listingId && !initialAudioData ? "upload" : "general");
  const [errorTabs, setErrorTabs] = useState<string[]>([]);
  const { state, dispatch } = useListingForm(null, initialAudioData);
  const { title, slug, description, scholarId, language, translationChanges, saving, formError } =
    state;

  const mainLocale = (language || "ar") as Locale;
  const otherLocale: Locale = mainLocale === "en" ? "ar" : "en";
  const errorTabSet = new Set(errorTabs);

  const handleClose = () => {
    setErrorTabs([]);
    onClose();
  };

  // Fetch form data when opening modal in edit mode with listingId
  useEffect(() => {
    if (!isOpen || !listingId) return;

    let cancelled = false;

    const loadFormData = async () => {
      try {
        const data = await fetchListingFormData(listingId);
        if (!cancelled) {
          dispatch({ type: "INIT_STATE", data });
        }
      } catch (err) {
        if (!cancelled) {
          fetchErrorRef.current = sanitizeError(err);
        }
      }
    };

    loadFormData();

    return () => {
      cancelled = true;
    };
  }, [isOpen, listingId, dispatch]);

  const { data: scholarsData } = useApiQuery<{ scholars: ScholarListItemDto[] }>(
    [...queryKeys.scholars.list.all()],
    () =>
      httpClient<{ scholars: ScholarListItemDto[] }>({
        url: endpoints.scholars.list,
        method: "GET",
      }),
  );

  const { data: topicsData } = useTopicsList();

  useEffect(() => {
    if (!listingId || !scholarId || !scholarsData?.scholars) return;
    const selectedScholar = scholarsData.scholars.find((s) => s.id === scholarId);
    if (selectedScholar && selectedScholar.mainLanguage) {
      dispatch({
        type: "UPDATE_FIELD",
        field: "language",
        value: selectedScholar.mainLanguage as Locale,
      });
    }
  }, [listingId, scholarId, scholarsData, dispatch]);

  const handleTitleChange = (val: string) => {
    if (!listingId) {
      dispatch({ type: "UPDATE_FIELD", field: "title", value: val });
      dispatch({
        type: "UPDATE_FIELD",
        field: "slug",
        value: val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-"),
      });
    } else {
      dispatch({ type: "UPDATE_FIELD", field: "title", value: val });
    }
  };

  const handleTopicToggle = (topicId: string) => {
    const selectedTopics = state.selectedTopics;
    dispatch({
      type: "UPDATE_FIELD",
      field: "selectedTopics",
      value: selectedTopics.includes(topicId)
        ? selectedTopics.filter((id) => id !== topicId)
        : [...selectedTopics, topicId],
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errTabs: string[] = [];

    if (!scholarId || !language || !state.selectedTopics || state.selectedTopics.length === 0) {
      errTabs.push("general");
    }
    if (!title.trim() || (!listingId && !slug?.trim())) {
      errTabs.push("main");
    }
    if (!listingId && !initialAudioData) {
      errTabs.push("upload");
    }

    if (errTabs.length > 0) {
      setErrorTabs(errTabs);
      let errorMsg = t(
        "admin.contents.listing.requiredFieldsMissing",
        "Language, scholar, at least one topic, title, and slug are required.",
      );
      if (errTabs.includes("upload") && !initialAudioData) {
        errorMsg = t(
          "admin.contents.listing.audioKeyRequired",
          "Audio file key is required for creation.",
        );
      }
      dispatch({
        type: "SET_ERROR",
        error: errorMsg,
      });
      return;
    }

    setErrorTabs([]);
    dispatch({ type: "SET_SAVING", saving: true });
    dispatch({ type: "SET_ERROR", error: null });

    try {
      if (listingId) {
        const payload: any = {
          title,
          description: state.description,
          status: state.status,
          orderIndex: Number(state.orderIndex),
          language,
        };

        // Build translations array using utility (N-locale safe)
        const secondaryLocales = getSecondaryLocales(mainLocale);
        payload.translations = buildTranslationsPayload(
          translationChanges,
          secondaryLocales,
          (v) => !!(v?.title || v?.description),
        );

        await updateLecture(listingId, payload);
      } else {
        if (!initialAudioData) {
          setErrorTabs(["upload"]);
          dispatch({
            type: "SET_ERROR",
            error: t(
              "admin.contents.listing.audioKeyRequired",
              "Audio file key is required for creation.",
            ),
          });
          dispatch({ type: "SET_SAVING", saving: false });
          return;
        }
        const payload: any = {
          title,
          slug: slug || undefined,
          scholarId,
          parentId: state.seriesId || undefined,
          topics: state.selectedTopics,
          format: "single",
          audioKey: initialAudioData.audioKey,
          durationSeconds: initialAudioData.durationSeconds,
          sizeBytes: initialAudioData.sizeBytes,
          language,
        };

        // Build translations array using utility (N-locale safe)
        const secondaryLocales = getSecondaryLocales(mainLocale);
        payload.translations = buildTranslationsPayload(
          translationChanges,
          secondaryLocales,
          (v) => !!(v?.title || v?.description),
        );

        await createLecture(payload);
      }
      await onSuccess();
      onClose();
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        error:
          (err as Error)?.message ||
          t("admin.contents.listing.failedToSave", "Failed to save lecture details."),
      });
    } finally {
      dispatch({ type: "SET_SAVING", saving: false });
    }
  };

  const scholars = scholarsData?.scholars ?? [];
  const topics = topicsData ?? [];

  return (
    <Modal
      key={listingId ?? "create"}
      isOpen={isOpen}
      onClose={handleClose}
      title={
        listingId
          ? `${t("admin.contents.listing.editTitle", "Editing Listing Details")}${isDesktop && title ? ` (${title})` : ""}`
          : t("admin.contents.listing.newTitle", "New Listing Details")
      }
      size="xl"
      width="wide"
      height="long"
      multiTab
      requireReview={!showAudioUploadTab || !!initialAudioData}
      errorTabs={errorTabs}
      activeTab={activeTab}
      onActiveTabChange={(id) => setActiveTab(id as typeof activeTab)}
      defaultActiveTab="general"
      saveFormId="lecture-edit-form"
      saving={saving}
      reviewTabId="review"
    >
      <form id="lecture-edit-form" onSubmit={handleSave} className={styles.form}>
        <Modal.Tabs errorTabs={errorTabs}>
          <Modal.TabItem id="general">{t("admin.modal.generalTab", "General")}</Modal.TabItem>
          <Modal.TabItem id="main">{mainLocale === "en" ? "English" : "العربية"}</Modal.TabItem>
          <Modal.TabItem id="other">{otherLocale === "en" ? "English" : "العربية"}</Modal.TabItem>
          <Modal.TabItem id="upload">
            {t("admin.contents.listing.uploadTab", "Upload Audio")}
          </Modal.TabItem>
          <Modal.TabItem id="arrange">
            {t("admin.contents.listing.arrangeTab", "Arrange")}
          </Modal.TabItem>
          <Modal.TabItem id="review">{t("admin.modal.reviewTab", "Review")}</Modal.TabItem>
        </Modal.Tabs>

        <ListingModalTabContent
          state={state}
          dispatch={dispatch}
          activeTab={activeTab}
          errorTabSet={errorTabSet}
          scholars={scholars}
          topics={topics}
          handleTopicToggle={handleTopicToggle}
          handleTitleChange={handleTitleChange}
          onAudioUploadComplete={onAudioUploadComplete}
          mainLocale={mainLocale}
          otherLocale={otherLocale}
        />
      </form>
    </Modal>
  );
}
