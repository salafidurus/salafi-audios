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
import {
  useListingForm,
  type FormAction,
  type FormState,
} from "@/features/admin/hooks/Content/useListingForm";
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

function hasSublistings(state: ReturnType<typeof useListingForm>["state"]): boolean {
  return state.isEditing && Boolean(state.id) && state.format !== "single";
}

function getListingModalTitle(
  state: ReturnType<typeof useListingForm>["state"],
  isDesktop: boolean,
  t: ReturnType<typeof useTranslation>["t"],
): string {
  if (!state.isEditing) return t("admin.contents.listing.newTitle", "New Listing Details");
  const suffix = isDesktop && state.title ? ` (${state.title})` : "";
  return `${t("admin.contents.listing.editTitle", "Edit Listing Details")}${suffix}`;
}

function toggleTopic(selectedTopics: string[], topicId: string): string[] {
  return selectedTopics.includes(topicId)
    ? selectedTopics.filter((id) => id !== topicId)
    : [...selectedTopics, topicId];
}

function ListingModalFooter({
  activeTab,
  saving,
  onClose,
  onReview,
  t,
}: {
  activeTab: string;
  saving: boolean;
  onClose: () => void;
  onReview: () => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <DialogFooter>
      <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
        {t("common.cancel", "Cancel")}
      </Button>
      {activeTab === "review" ? (
        <Button type="submit" form="lecture-form" variant="primary" loading={saving}>
          {saving ? t("admin.access.saving", "Saving…") : t("common.save", "Save")}
        </Button>
      ) : (
        <Button type="button" variant="primary" onClick={onReview}>
          {t("admin.modal.reviewTab", "Review")}
        </Button>
      )}
    </DialogFooter>
  );
}

function useListingFormHydration(
  listingId: string | null | undefined,
  dispatch: ReturnType<typeof useListingForm>["dispatch"],
) {
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const formDataLoadedRef = useRef(false);

  useEffect(() => {
    if (!listingId || formDataLoadedRef.current || loadingRef.current) return;

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

  return { loading, fetchError };
}

type ListingModalTab = "general" | "main" | "sublistings" | "review";

type ListingModalTabsProps = {
  activeTab: ListingModalTab;
  onTabChange: (tab: ListingModalTab) => void;
  errorTabs: string[];
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  scholars: ScholarListItemDto[];
  topics: ReturnType<typeof useTopicsList>["data"];
  handleTopicToggle: (topicId: string) => void;
  handleTitleChange: (value: string) => void;
  mainLocale: Locale;
  handleImageStaged: (file: File | null, preview: string | null) => void;
  showSublistingsTab: boolean;
  stagedImagePreview: string | null;
  t: ReturnType<typeof useTranslation>["t"];
};

function ListingModalTabs({
  activeTab,
  onTabChange,
  errorTabs,
  state,
  dispatch,
  scholars,
  topics,
  handleTopicToggle,
  handleTitleChange,
  mainLocale,
  handleImageStaged,
  showSublistingsTab,
  stagedImagePreview,
  t,
}: ListingModalTabsProps) {
  const tabs: ListingModalTab[] = showSublistingsTab
    ? ["general", "main", "sublistings", "review"]
    : ["general", "main", "review"];
  const errorTabSet = new Set(errorTabs);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(id) => {
        if (isListingModalTab(id)) onTabChange(id);
      }}
      className="min-h-0"
    >
      <TabsList
        className="no-scrollbar w-full justify-start overflow-x-auto overflow-y-hidden"
        aria-label={t("admin.modal.tabsLabel", "Form sections")}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            aria-invalid={errorTabSet.has(tab) || undefined}
            onClick={() => onTabChange(tab)}
          >
            {tab === "general"
              ? t("admin.modal.generalTab", "General")
              : tab === "main"
                ? getLocaleLabel(mainLocale)
                : tab === "sublistings"
                  ? t("admin.contents.listing.sublistingsTab", "Sub-listings")
                  : t("admin.modal.reviewTab", "Review")}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab} value={tab}>
          <ListingModalTabContent
            state={state}
            dispatch={dispatch}
            activeTab={tab}
            errorTabSet={errorTabSet}
            scholars={scholars}
            topics={topics ?? []}
            handleTopicToggle={handleTopicToggle}
            handleTitleChange={handleTitleChange}
            mainLocale={mainLocale}
            isEditing={state.isEditing}
            onImageStaged={handleImageStaged}
            stagedImagePreview={stagedImagePreview}
            showSublistingsTab={showSublistingsTab}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function ListingModalLoading({
  isOpen,
  onClose,
  fetchError,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  fetchError: string | null;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("admin.contents.listing.editTitle", "Edit Listing Details")}
      size="xl"
    >
      <div className={styles.loading}>{t("common.loading", "Loading...")}</div>
      {fetchError && <div className={styles.error}>{fetchError}</div>}
    </Modal>
  );
}

export function ListingModal({ isOpen, onClose, onSuccess, listingId }: ListingModalProps) {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const [activeTab, setActiveTab] = useState<"general" | "main" | "sublistings" | "review">(
    "general",
  );
  const [errorTabs, setErrorTabs] = useState<string[]>([]);

  // Starts in create mode; edit-mode data is hydrated via INIT_FORM once fetched.
  const { state, dispatch } = useListingForm();
  const { loading, fetchError } = useListingFormHydration(listingId, dispatch);

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
      value: toggleTopic(selectedTopics, topicId),
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
      <ListingModalLoading isOpen={isOpen} onClose={handleClose} fetchError={fetchError} t={t} />
    );
  }

  const scholars = scholarsData?.scholars ?? [];
  const topicsArray = topicsData ?? [];
  // SAFETY: listing form state stores only supported locale values for the main content language.
  const mainLocale = (state.language || "ar") as Locale;
  const showSublistingsTab = hasSublistings(state);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !state.saving && handleClose()}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{getListingModalTitle(state, isDesktop, t)}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("admin.modal.formDescription", "Complete each tab before saving.")}
          </DialogDescription>
        </DialogHeader>

        <form id="lecture-form" onSubmit={handleSave} className={`${styles.form} min-h-0 flex-1`}>
          <ListingModalTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            errorTabs={errorTabs}
            state={state}
            dispatch={dispatch}
            scholars={scholars}
            topics={topicsArray}
            handleTopicToggle={handleTopicToggle}
            handleTitleChange={handleTitleChange}
            mainLocale={mainLocale}
            handleImageStaged={handleImageStaged}
            showSublistingsTab={showSublistingsTab}
            stagedImagePreview={state.stagedImagePreview}
            t={t}
          />

          <ListingModalFooter
            activeTab={activeTab}
            saving={state.saving}
            onClose={handleClose}
            onReview={() => setActiveTab("review")}
            t={t}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
