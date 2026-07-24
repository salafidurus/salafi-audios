"use client";

import React, { useState } from "react";
import type { ListingFormat } from "@sd/core-contracts";
import { useTranslation } from "@/core/i18n/use-translation";
import { useListingFormatTransition } from "@/features/admin/hooks/Content/useListingFormatTransition";
import { Modal } from "@/shared/components/Modal";
import styles from "./listing-modal.module.css";

interface ListingFormatFieldProps {
  mode: "create" | "edit";
  format: ListingFormat;
  listingId?: string;
  onCreateFormatChange?: (format: ListingFormat) => void;
  onTransitioned?: () => void;
}

export function ListingFormatField({
  mode,
  format,
  listingId,
  onCreateFormatChange,
  onTransitioned,
}: ListingFormatFieldProps) {
  const { t } = useTranslation();
  const [confirmAction, setConfirmAction] = useState<{
    type: "promote" | "demote";
    target?: "series" | "single";
  } | null>(null);
  const [isPending, setIsPending] = useState(false);

  const { data: transitionInfo } = useListingFormatTransition(
    mode === "edit" ? listingId : undefined,
  );

  if (mode === "create") {
    return (
      <div className={styles.formGroup}>
        <label htmlFor="format-control" className={styles.label}>
          {t("admin.contents.listing.formatLabel", "Format")} *
        </label>
        <div
          id="format-control"
          className={styles.segmentedControl}
          role="group"
          aria-labelledby="format-label"
        >
          {(["single", "series", "collection"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={`${styles.segmentButton} ${format === f ? styles.active : ""}`}
              onClick={() => onCreateFormatChange?.(f)}
              aria-pressed={format === f}
            >
              {f === "single"
                ? t("admin.contents.listing.single", "Single")
                : f === "series"
                  ? t("admin.contents.listing.series", "Series")
                  : t("admin.contents.listing.collection", "Collection")}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!transitionInfo) {
    return <div>{t("admin.loading", "Loading...")}</div>;
  }

  const handlePromote = async () => {
    if (!listingId || !transitionInfo.canPromote) return;
    setIsPending(true);
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/promote`, {
        method: "POST",
      });
      if (response.ok) {
        setConfirmAction(null);
        onTransitioned?.();
      }
    } finally {
      setIsPending(false);
    }
  };

  const handleDemote = async (target: "series" | "single") => {
    if (!listingId) return;
    setIsPending(true);
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/demote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      if (response.ok) {
        setConfirmAction(null);
        onTransitioned?.();
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div className={styles.formGroup}>
        <label className={styles.label}>
          {t("admin.contents.listing.formatLabel", "Format")}
          <div className={styles.formatDisplay}>
            <span className={styles.currentFormat}>{format}</span>
            <div className={styles.formatActions}>
              {transitionInfo.canPromote && (
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => setConfirmAction({ type: "promote" })}
                  disabled={isPending}
                >
                  {t("admin.contents.listing.promote", "Promote")}
                </button>
              )}
              {transitionInfo.demoteOptions.map((option) => (
                <button
                  key={option.target}
                  type="button"
                  className={styles.actionButton}
                  onClick={() => setConfirmAction({ type: "demote", target: option.target })}
                  disabled={!option.allowed || isPending}
                  title={option.reason || undefined}
                >
                  {t("admin.contents.listing.demoteTo", "Demote to")} {option.target}
                </button>
              ))}
            </div>
          </div>
        </label>
      </div>

      {confirmAction && (
        <Modal
          isOpen
          onClose={() => setConfirmAction(null)}
          title={
            confirmAction.type === "promote"
              ? t("admin.contents.listing.confirmPromote", "Confirm Promotion")
              : t("admin.contents.listing.confirmDemote", "Confirm Demotion")
          }
          size="sm"
        >
          <div className={styles.confirmContent}>
            <p>
              {confirmAction.type === "promote"
                ? t(
                    "admin.contents.listing.promoteWarning",
                    "This will promote the listing and reorganize its content. Continue?",
                  )
                : t(
                    "admin.contents.listing.demoteWarning",
                    "This will demote the listing and reorganize its content. Continue?",
                  )}
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className={styles.cancelButton}
              >
                {t("admin.common.cancel", "Cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmAction.type === "promote") {
                    handlePromote();
                  } else if (confirmAction.target) {
                    handleDemote(confirmAction.target);
                  }
                }}
                disabled={isPending}
                className={styles.confirmButton}
              >
                {isPending
                  ? t("admin.common.working", "Working...")
                  : t("admin.common.confirm", "Confirm")}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
