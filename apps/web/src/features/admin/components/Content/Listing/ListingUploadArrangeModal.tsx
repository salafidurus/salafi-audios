"use client";

import React, { useEffect, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { fetchArrangeData } from "@/features/admin/api/admin-lectures.api";
import { useUploadArrangeCommit } from "@/features/admin/hooks/Content/useUploadArrangeCommit";
import {
  ROOT_MODULE_KEY,
  localSlugConflicts,
  useUploadArrangeState,
} from "@/features/admin/hooks/Content/useUploadArrangeState";
import { Modal } from "@/shared/components/ui/modal";
import { useIsDesktop } from "@/shared/hooks/use-responsive";

import styles from "./listing-modal.module.css";
import {
  UploadArrangeArrangeTab,
  UploadArrangeReviewTab,
  UploadArrangeUploadTab,
} from "./UploadArrange";

interface ListingUploadArrangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  listingId?: string | null;
}

function getErrorMessage(error: Error | null, fallback: string): string {
  return error?.message ?? fallback;
}

function isUploadArrangeTabId(id: string): id is "upload" | "arrange" | "review" {
  return id === "upload" || id === "arrange" || id === "review";
}

export function ListingUploadArrangeModal({
  isOpen,
  onClose,
  onSuccess,
  listingId,
}: ListingUploadArrangeModalProps) {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  // The modal is keyed by listingId (see ListingsContent.tsx), so this component is
  // freshly mounted on every open — these initial values already are the "reset" state.
  const [activeTab, setActiveTab] = useState<"upload" | "arrange" | "review">("upload");
  const { state, dispatch } = useUploadArrangeState();

  useEffect(() => {
    if (!isOpen || !listingId) return;
    fetchArrangeData(listingId)
      .then((data) => dispatch({ type: "INIT_EXISTING", data }))
      .catch((err) =>
        dispatch({
          type: "SET_ERROR",
          error: getErrorMessage(
            err instanceof Error ? err : null,
            t("admin.contents.listing.failedToLoadArrange", "Failed to load listing data."),
          ),
        }),
      );
  }, [isOpen, listingId, dispatch, t]);

  const runCommit = useUploadArrangeCommit(state, dispatch, onSuccess);

  const conflicts = localSlugConflicts(state);
  const unassignedCount =
    state.existing?.format === "collection"
      ? state.items.filter(
          (item) =>
            item.assignment.kind === "new-lesson" && item.assignment.moduleKey === ROOT_MODULE_KEY,
        ).length
      : 0;

  const busy =
    state.phase === "presigning" || state.phase === "uploading" || state.phase === "committing";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !state.existing) return;
    if (state.items.length === 0) {
      dispatch({
        type: "SET_ERROR",
        error: t("admin.contents.listing.noFilesStaged", "Add at least one audio file first."),
      });
      setActiveTab("upload");
      return;
    }
    if (conflicts.length > 0) {
      dispatch({
        type: "SET_ERROR",
        error: t(
          "admin.contents.listing.resolveConflicts",
          "Resolve the slug conflicts in the Arrange tab first.",
        ),
      });
      setActiveTab("arrange");
      return;
    }
    if (unassignedCount > 0) {
      dispatch({
        type: "SET_ERROR",
        error: t(
          "admin.contents.listing.resolveUnassigned",
          "Assign every file to a module in the Arrange tab first.",
        ),
      });
      setActiveTab("arrange");
      return;
    }
    void runCommit();
  };

  const savingLabel =
    state.phase === "committing"
      ? t("admin.contents.listing.saving", "Saving…")
      : t("admin.contents.listing.uploading", "Uploading…");

  const errorTabs =
    conflicts.length > 0 || state.conflictSlugs.length > 0 || unassignedCount > 0
      ? ["arrange"]
      : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        state.existing && isDesktop
          ? `${t("admin.contents.listing.uploadArrangeTitle", "Upload & Arrange")} (${state.existing.title})`
          : t("admin.contents.listing.uploadArrangeTitle", "Upload & Arrange")
      }
      size="xl"
      width="wide"
      height="long"
      multiTab
      requireReview
      activeTab={activeTab}
      onActiveTabChange={(id) => {
        if (isUploadArrangeTabId(id)) {
          setActiveTab(id);
        }
      }}
      defaultActiveTab="upload"
      saveFormId="listing-upload-arrange-form"
      saving={busy}
      saveLabel={t("admin.contents.listing.uploadAction", "Upload")}
      savingLabel={savingLabel}
      reviewTabId="review"
      errorTabs={errorTabs}
    >
      <form id="listing-upload-arrange-form" onSubmit={handleSubmit} className={styles.form}>
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
            {state.error && <div className={styles.errorBanner}>{state.error}</div>}
            <UploadArrangeUploadTab state={state} dispatch={dispatch} />
          </Modal.ContentItem>

          <Modal.ContentItem id="arrange">
            {state.error && <div className={styles.errorBanner}>{state.error}</div>}
            <UploadArrangeArrangeTab state={state} dispatch={dispatch} />
          </Modal.ContentItem>

          <Modal.ContentItem id="review">
            {state.error && <div className={styles.errorBanner}>{state.error}</div>}
            <UploadArrangeReviewTab state={state} dispatch={dispatch} />
          </Modal.ContentItem>
        </Modal.Content>
      </form>
    </Modal>
  );
}
