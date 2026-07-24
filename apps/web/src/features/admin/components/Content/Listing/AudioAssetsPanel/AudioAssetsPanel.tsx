"use client";

import React, { useState } from "react";
import { useTranslation } from "@/core/i18n/use-translation";
import { useAdminAudioAssets } from "@/features/admin/hooks/Content/useAdminAudioAssets";
import { useAudioAssetActions } from "@/features/admin/hooks/Content/useAudioAssetActions";
import { AudioAssetRow } from "./AudioAssetRow";
import { Modal } from "@/shared/components/Modal";

interface AudioAssetsPanelProps {
  listingId: string;
}

export function AudioAssetsPanel({ listingId }: AudioAssetsPanelProps) {
  const { t } = useTranslation();
  const { data: assets = [] } = useAdminAudioAssets(listingId);
  const { promoteAsset, deleteAsset } = useAudioAssetActions(listingId);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!confirmDelete || deleteAsset.isPending) return;
    await deleteAsset.mutateAsync(confirmDelete);
    setConfirmDelete(null);
  };

  return (
    <>
      <div
        style={{
          border: "1px solid var(--border-secondary)",
          borderRadius: "0.5rem",
          overflow: "hidden",
        }}
      >
        {assets.length === 0 ? (
          <div
            style={{
              padding: "1.5rem",
              textAlign: "center",
              color: "var(--content-tertiary)",
            }}
          >
            {t("admin.contents.listing.noAudioAssets", "No audio assets")}
          </div>
        ) : (
          assets.map((asset) => (
            <AudioAssetRow
              key={asset.id}
              asset={asset}
              onPromote={(id) => promoteAsset.mutate(id)}
              onDelete={(id) => setConfirmDelete(id)}
              isPending={promoteAsset.isPending || deleteAsset.isPending}
            />
          ))
        )}
      </div>

      {confirmDelete && (
        <Modal
          isOpen
          onClose={() => setConfirmDelete(null)}
          title={t("admin.contents.listing.deleteAudioAsset", "Delete Audio Asset")}
          size="sm"
        >
          <div style={{ padding: "1rem" }}>
            <p>
              {t(
                "admin.contents.listing.deleteAudioAssetWarning",
                "Are you sure you want to delete this audio asset?",
              )}
            </p>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "flex-end",
                marginTop: "1rem",
              }}
            >
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                style={{ padding: "0.5rem 1rem" }}
              >
                {t("admin.common.cancel", "Cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteAsset.isPending}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "var(--state-error)",
                  color: "white",
                  cursor: deleteAsset.isPending ? "not-allowed" : "pointer",
                  opacity: deleteAsset.isPending ? 0.5 : 1,
                }}
              >
                {deleteAsset.isPending
                  ? t("admin.common.working", "Working...")
                  : t("admin.common.delete", "Delete")}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
