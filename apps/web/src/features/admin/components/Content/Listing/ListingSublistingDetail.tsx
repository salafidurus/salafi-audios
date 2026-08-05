"use client";

import { sanitizeError } from "@sd/utils-error";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { LectureStatus } from "@/shared/types/form-types";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  fetchListingFormData,
  updateListingDetails,
} from "@/features/admin/api/admin-lectures.api";
import { Button } from "@/shared/components/Button";
import { InputField } from "@/shared/components/InputField";

import styles from "./listing-modal.module.css";
import { ListingStatusOrderFields } from "./ListingStatusOrderFields";

export interface ListingSublistingDetailProps {
  childId: string;
  onBack: () => void;
  /** Called after a successful save — the parent returns to the sub-listings list. */
  onSaved: () => void;
}

interface DetailState {
  status: "loading" | "ready" | "error";
  error: string | null;
  title: string;
  description: string;
  lectureStatus: LectureStatus;
  orderIndex: number;
  saving: boolean;
}

const initialState: DetailState = {
  status: "loading",
  error: null,
  title: "",
  description: "",
  lectureStatus: "draft",
  orderIndex: 0,
  saving: false,
};

/**
 * One level of drill-down from the "Sub-listings" tab: edits a single child
 * listing's (module or lesson) own title/description/status/orderIndex,
 * reusing the same generic form-data/update-details endpoints as the root
 * listing modal — modules/lessons are just Listing rows with a parentId.
 */
export function ListingSublistingDetail({
  childId,
  onBack,
  onSaved,
}: ListingSublistingDetailProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<DetailState>(initialState);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    fetchListingFormData(childId)
      .then((data) => {
        setState((prev) => ({
          ...prev,
          status: "ready",
          title: data.listing.title,
          description: data.listing.description ?? "",
          lectureStatus: (data.listing.status as LectureStatus) ?? "draft",
          orderIndex: data.listing.orderIndex ?? 0,
        }));
      })
      .catch((err) => {
        setState((prev) => ({ ...prev, status: "error", error: sanitizeError(err) }));
      });
    // childId is fixed for the lifetime of this component (remounted via `key`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    if (!state.title.trim()) {
      setState((prev) => ({
        ...prev,
        error: t("admin.contents.listing.titleRequired", "Title must not be empty"),
      }));
      return;
    }

    setState((prev) => ({ ...prev, saving: true, error: null }));
    try {
      await updateListingDetails(childId, {
        title: state.title,
        description: state.description,
        status: state.lectureStatus,
        orderIndex: state.orderIndex,
      });
      onSaved();
    } catch (err) {
      setState((prev) => ({ ...prev, error: sanitizeError(err) }));
    } finally {
      setState((prev) => ({ ...prev, saving: false }));
    }
  }

  return (
    <div className={styles.childDetail}>
      <div className={styles.backRow}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={<ArrowLeft size={16} />}
          onClick={onBack}
        >
          {t("common.back", "Back")}
        </Button>
      </div>

      {state.status === "loading" && (
        <div className={styles.loading}>{t("common.loading", "Loading...")}</div>
      )}

      {state.status === "error" && (
        <div className={styles.error}>
          {state.error ?? t("admin.contents.failedToLoad", "Failed to load")}
        </div>
      )}

      {state.status === "ready" && (
        <>
          {state.error && <div className={styles.error}>{state.error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="sublisting-title" className={styles.label}>
              {t("admin.contents.listing.titleLabel", "Title")} *
            </label>
            <InputField
              id="sublisting-title"
              type="text"
              value={state.title}
              onChange={(value) => setState((prev) => ({ ...prev, title: value }))}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="sublisting-description" className={styles.label}>
              {t("admin.contents.listing.descriptionLabel", "Description")}
            </label>
            <InputField
              id="sublisting-description"
              type="textarea"
              value={state.description}
              onChange={(value) => setState((prev) => ({ ...prev, description: value }))}
              rows={3}
            />
          </div>

          <ListingStatusOrderFields
            status={state.lectureStatus}
            orderIndex={state.orderIndex}
            onStatusChange={(value) => setState((prev) => ({ ...prev, lectureStatus: value }))}
            onOrderIndexChange={(value) => setState((prev) => ({ ...prev, orderIndex: value }))}
            idPrefix="sublisting"
          />

          <div className={styles.childDetailActions}>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={state.saving}
              disabled={state.saving}
              onClick={handleSave}
            >
              {state.saving ? t("admin.access.saving", "Saving…") : t("common.save", "Save")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
