"use client";

import {
  type ScholarListItemDto,
  useApiQuery,
  queryKeys,
  httpClient,
  endpoints,
  type Locale,
} from "@sd/core-contracts";
import { useTopicsList } from "@sd/domain-search";
import { sanitizeError } from "@sd/utils-error";
import React, { useState, useEffect, useRef } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { fetchListingFormData } from "@/features/admin/api/admin-lectures.api";
import { useListingForm } from "@/features/admin/hooks/Content/useListingForm";
import { useSaveListing } from "@/features/admin/hooks/Content/useSaveListing";
import { getLocaleLabel } from "@/features/admin/utils/locale-tabs";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Modal } from "@/shared/components/ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useIsDesktop } from "@/shared/hooks/use-responsive";

import styles from "./listing-modal.module.css";
import { ListingModalTabContent } from "./ListingModalTabContent";

export interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  listingId?: string | null;
}

function isListingModalTab(id: string): id is "general" | "main" | "sublistings" | "review" {
  return id === "general" || id === "main" || id === "sublistings" || id === "review";
}

export function ListingModal({ isOpen, onClose, onSuccess, listingId }: ListingModalProps) {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const [activeTab, setActiveTab] = useState<"general" | "main" | "sublistings" | "review">(
    "general",
  );
  const [errorTabs, setErrorTabs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const formDataLoadedRef = useRef(false);

  // Starts in create mode; edit-mode data is hydrated via INIT_FORM once fetched.
  const { state, dispatch } = useListingForm();

  // Load form data if editing
  useEffect(() => {
    if (!listingId || formDataLoadedRef.current) return;
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setFetchError(null);

    fetchListingFormData(listingId)
      .then((data) => {
        dispatch({ type: "INIT_FORM", data });
        formDataLoadedRef.current = true;
        setLoading(false);
      })
      .catch((err) => {
        setFetchError(sanitizeError(err));
        setLoading(false);
        loadingRef.current = false;
      });
  }, [listingId, dispatch]);

  const handleClose = () => {
    setErrorTabs([]);
    onClose();
  };

  const { data: scholarsData } = useApiQuery<{ scholars: ScholarListItemDto[] }>(
    [...queryKeys.scholars.list.all()],
    () =>
      httpClient<{ scholars: ScholarListItemDto[] }>({
        url: endpoints.scholars.list,
        method: "GET",
      }),
  );

  const { data: topicsData } = useTopicsList();

  const handleTitleChange = (val: string) => {
    dispatch({ type: "UPDATE_FIELD", field: "title", value: val });
  };

  const handleTopicToggle = (topicId: string) => {
    const selectedTopics = state.selectedTopics || [];
    dispatch({
      type: "UPDATE_FIELD",
      field: "selectedTopics",
      value: selectedTopics.includes(topicId)
        ? selectedTopics.filter((id) => id !== topicId)
        : [...selectedTopics, topicId],
    });
  };

  const handleImageStaged = (file: File | null, preview: string | null) => {
    dispatch({ type: "SET_STAGED_IMAGE", file, preview });
    if (file && preview) {
      dispatch({ type: "UPDATE_FIELD", field: "coverImageUrl", value: preview });
    }
  };

  const handleSave = useSaveListing(state, dispatch, onSuccess, onClose, setErrorTabs);

  if (!state.isEditing && loading) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={t("admin.contents.listing.editTitle", "Edit Listing Details")}
        size="xl"
      >
        {loading && <div className={styles.loading}>{t("common.loading", "Loading...")}</div>}
        {fetchError && <div className={styles.error}>{fetchError}</div>}
      </Modal>
    );
  }

  const scholars = scholarsData?.scholars ?? [];
  const topicsArray = topicsData ?? [];
  // SAFETY: listing form state stores only supported locale values for the main content language.
  const mainLocale = (state.language || "ar") as Locale;
  const errorTabSet = new Set(errorTabs);
  const showSublistingsTab = state.isEditing && !!state.id && state.format !== "single";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !state.saving && handleClose()}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {state.isEditing
              ? `${t("admin.contents.listing.editTitle", "Edit Listing Details")}${isDesktop && state.title ? ` (${state.title})` : ""}`
              : t("admin.contents.listing.newTitle", "New Listing Details")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("admin.modal.formDescription", "Complete each tab before saving.")}
          </DialogDescription>
        </DialogHeader>

        <form id="lecture-form" onSubmit={handleSave} className={`${styles.form} min-h-0 flex-1`}>
          <Tabs
            value={activeTab}
            onValueChange={(id) => {
              if (isListingModalTab(id)) setActiveTab(id);
            }}
            className="min-h-0"
          >
            <TabsList
              className="no-scrollbar w-full justify-start overflow-x-auto overflow-y-hidden"
              aria-label={t("admin.modal.tabsLabel", "Form sections")}
            >
              <TabsTrigger
                value="general"
                aria-invalid={errorTabs.includes("general") || undefined}
                onClick={() => setActiveTab("general")}
              >
                {t("admin.modal.generalTab", "General")}
              </TabsTrigger>
              <TabsTrigger
                value="main"
                aria-invalid={errorTabs.includes("main") || undefined}
                onClick={() => setActiveTab("main")}
              >
                {getLocaleLabel(mainLocale)}
              </TabsTrigger>
              {showSublistingsTab && (
                <TabsTrigger
                  value="sublistings"
                  aria-invalid={errorTabs.includes("sublistings") || undefined}
                  onClick={() => setActiveTab("sublistings")}
                >
                  {t("admin.contents.listing.sublistingsTab", "Sub-listings")}
                </TabsTrigger>
              )}
              <TabsTrigger
                value="review"
                aria-invalid={errorTabs.includes("review") || undefined}
                onClick={() => setActiveTab("review")}
              >
                {t("admin.modal.reviewTab", "Review")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <ListingModalTabContent
                state={state}
                dispatch={dispatch}
                activeTab="general"
                errorTabSet={errorTabSet}
                scholars={scholars}
                topics={topicsArray}
                handleTopicToggle={handleTopicToggle}
                handleTitleChange={handleTitleChange}
                mainLocale={mainLocale}
                isEditing={state.isEditing}
                onImageStaged={handleImageStaged}
                stagedImagePreview={state.stagedImagePreview}
                showSublistingsTab={showSublistingsTab}
              />
            </TabsContent>
            <TabsContent value="main">
              <ListingModalTabContent
                state={state}
                dispatch={dispatch}
                activeTab="main"
                errorTabSet={errorTabSet}
                scholars={scholars}
                topics={topicsArray}
                handleTopicToggle={handleTopicToggle}
                handleTitleChange={handleTitleChange}
                mainLocale={mainLocale}
                isEditing={state.isEditing}
                onImageStaged={handleImageStaged}
                stagedImagePreview={state.stagedImagePreview}
                showSublistingsTab={showSublistingsTab}
              />
            </TabsContent>
            {showSublistingsTab && (
              <TabsContent value="sublistings">
                <ListingModalTabContent
                  state={state}
                  dispatch={dispatch}
                  activeTab="sublistings"
                  errorTabSet={errorTabSet}
                  scholars={scholars}
                  topics={topicsArray}
                  handleTopicToggle={handleTopicToggle}
                  handleTitleChange={handleTitleChange}
                  mainLocale={mainLocale}
                  isEditing={state.isEditing}
                  onImageStaged={handleImageStaged}
                  stagedImagePreview={state.stagedImagePreview}
                  showSublistingsTab={showSublistingsTab}
                />
              </TabsContent>
            )}
            <TabsContent value="review">
              <ListingModalTabContent
                state={state}
                dispatch={dispatch}
                activeTab="review"
                errorTabSet={errorTabSet}
                scholars={scholars}
                topics={topicsArray}
                handleTopicToggle={handleTopicToggle}
                handleTitleChange={handleTitleChange}
                mainLocale={mainLocale}
                isEditing={state.isEditing}
                onImageStaged={handleImageStaged}
                stagedImagePreview={state.stagedImagePreview}
                showSublistingsTab={showSublistingsTab}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={handleClose} disabled={state.saving}>
              {t("common.cancel", "Cancel")}
            </Button>
            {activeTab === "review" ? (
              <Button type="submit" form="lecture-form" variant="primary" loading={state.saving}>
                {state.saving ? t("admin.access.saving", "Saving…") : t("common.save", "Save")}
              </Button>
            ) : (
              <Button type="button" variant="primary" onClick={() => setActiveTab("review")}>
                {t("admin.modal.reviewTab", "Review")}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
