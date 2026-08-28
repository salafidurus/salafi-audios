"use client";

import React, { useEffect, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { fetchArrangeData } from "@/features/admin/api/admin-lectures.api";
import { useUploadArrangeCommit } from "@/features/admin/hooks/Content/useUploadArrangeCommit";
import {
  ROOT_MODULE_KEY,
  localSlugConflicts,
  useUploadArrangeState,
  type UploadArrangeAction,
  type UploadArrangeState,
} from "@/features/admin/hooks/Content/useUploadArrangeState";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useIsDesktop } from "@/shared/hooks/use-responsive";

import { FormErrorBanner } from "./FormErrorBanner";
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

type ArrangeFooterProps = {
  activeTab: "upload" | "arrange" | "review";
  busy: boolean;
  savingLabel: string;
  onClose: () => void;
  onReview: () => void;
  t: ReturnType<typeof useTranslation>["t"];
};

function ArrangeFooter({ activeTab, busy, savingLabel, onClose, onReview, t }: ArrangeFooterProps) {
  return (
    <DialogFooter>
      <Button variant="outline" size="sm" onClick={onClose} disabled={busy}>
        {t("common.cancel", "Cancel")}
      </Button>
      {activeTab === "review" ? (
        <Button type="submit" form="listing-upload-arrange-form" variant="primary" loading={busy}>
          {busy ? savingLabel : t("admin.contents.listing.uploadAction", "Upload")}
        </Button>
      ) : (
        <Button type="button" variant="primary" onClick={onReview}>
          {t("admin.modal.reviewTab", "Review")}
        </Button>
      )}
    </DialogFooter>
  );
}

function handleArrangeSubmit(
  event: React.FormEvent,
  state: UploadArrangeState,
  busy: boolean,
  conflicts: string[],
  unassignedCount: number,
  dispatch: React.Dispatch<UploadArrangeAction>,
  setActiveTab: (tab: "upload" | "arrange" | "review") => void,
  runCommit: () => Promise<void> | void,
  t: ReturnType<typeof useTranslation>["t"],
) {
  event.preventDefault();
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
}

function getUnassignedCount(state: UploadArrangeState): number {
  if (state.existing?.format !== "collection") return 0;
  return state.items.filter(
    (item) =>
      item.assignment.kind === "new-lesson" && item.assignment.moduleKey === ROOT_MODULE_KEY,
  ).length;
}

function getArrangeTitle(
  state: UploadArrangeState,
  isDesktop: boolean,
  t: ReturnType<typeof useTranslation>["t"],
): string {
  const title = t("admin.contents.listing.uploadArrangeTitle", "Upload & Arrange");
  return state.existing && isDesktop ? `${title} (${state.existing.title})` : title;
}

function isArrangeBusy(phase: UploadArrangeState["phase"]): boolean {
  return phase === "presigning" || phase === "uploading" || phase === "committing";
}

function getSavingLabel(
  phase: UploadArrangeState["phase"],
  t: ReturnType<typeof useTranslation>["t"],
): string {
  return phase === "committing"
    ? t("admin.contents.listing.saving", "Saving…")
    : t("admin.contents.listing.uploading", "Uploading…");
}

function getErrorTabs(
  conflicts: string[],
  conflictSlugs: string[],
  unassignedCount: number,
): string[] {
  return conflicts.length > 0 || conflictSlugs.length > 0 || unassignedCount > 0 ? ["arrange"] : [];
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
  const unassignedCount = getUnassignedCount(state);

  const busy = isArrangeBusy(state.phase);
  const savingLabel = getSavingLabel(state.phase, t);
  const errorTabs = getErrorTabs(conflicts, state.conflictSlugs, unassignedCount);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{getArrangeTitle(state, isDesktop, t)}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("admin.modal.formDescription", "Complete each tab before saving.")}
          </DialogDescription>
        </DialogHeader>

        <form
          id="listing-upload-arrange-form"
          onSubmit={(event) =>
            handleArrangeSubmit(
              event,
              state,
              busy,
              conflicts,
              unassignedCount,
              dispatch,
              setActiveTab,
              runCommit,
              t,
            )
          }
          className={`${styles.form} min-h-0 flex-1`}
        >
          <Tabs
            value={activeTab}
            onValueChange={(id) => {
              if (isUploadArrangeTabId(id)) setActiveTab(id);
            }}
            className="min-h-0"
          >
            <TabsList
              className="no-scrollbar w-full justify-start overflow-x-auto overflow-y-hidden"
              aria-label={t("admin.modal.tabsLabel", "Form sections")}
            >
              <TabsTrigger value="upload">
                {t("admin.contents.listing.uploadTab", "Upload Audio")}
              </TabsTrigger>
              <TabsTrigger
                value="arrange"
                aria-invalid={errorTabs.includes("arrange") || undefined}
              >
                {t("admin.contents.listing.arrangeTab", "Arrange")}
              </TabsTrigger>
              <TabsTrigger value="review">{t("admin.modal.reviewTab", "Review")}</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <FormErrorBanner error={state.error} />
              <UploadArrangeUploadTab state={state} dispatch={dispatch} />
            </TabsContent>

            <TabsContent value="arrange">
              <FormErrorBanner error={state.error} />
              <UploadArrangeArrangeTab state={state} dispatch={dispatch} />
            </TabsContent>

            <TabsContent value="review">
              <FormErrorBanner error={state.error} />
              <UploadArrangeReviewTab state={state} dispatch={dispatch} />
            </TabsContent>
          </Tabs>

          <ArrangeFooter
            activeTab={activeTab}
            busy={busy}
            savingLabel={savingLabel}
            onClose={onClose}
            onReview={() => setActiveTab("review")}
            t={t}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
