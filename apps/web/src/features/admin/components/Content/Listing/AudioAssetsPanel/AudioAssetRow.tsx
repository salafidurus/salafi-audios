"use client";

import React from "react";
import type { AudioAssetViewDto } from "@sd/core-contracts";
import { useTranslation } from "@/core/i18n/use-translation";

interface AudioAssetRowProps {
  asset: AudioAssetViewDto;
  onPromote: (assetId: string) => void;
  onDelete: (assetId: string) => void;
  isPending: boolean;
}

export function AudioAssetRow({ asset, onPromote, onDelete, isPending }: AudioAssetRowProps) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem",
        borderBottom: "1px solid var(--border-secondary)",
        gap: "0.75rem",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>
            {asset.durationSeconds
              ? `${Math.floor(asset.durationSeconds / 60)}:${String(asset.durationSeconds % 60).padStart(2, "0")}`
              : "?"}
          </span>
          {asset.isPrimary && (
            <span
              style={{
                display: "inline-block",
                padding: "0.125rem 0.5rem",
                backgroundColor: "var(--state-success)",
                color: "white",
                borderRadius: "0.25rem",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              {t("admin.contents.listing.primary", "Primary")}
            </span>
          )}
        </div>
        {asset.format && (
          <div
            style={{ fontSize: "0.75rem", color: "var(--content-tertiary)", marginTop: "0.25rem" }}
          >
            {asset.format}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        {!asset.isPrimary && (
          <button
            type="button"
            onClick={() => onPromote(asset.id)}
            disabled={isPending}
            style={{
              padding: "0.375rem 0.75rem",
              fontSize: "0.75rem",
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.5 : 1,
            }}
          >
            {t("admin.contents.listing.promote", "Promote")}
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(asset.id)}
          disabled={isPending}
          style={{
            padding: "0.375rem 0.75rem",
            fontSize: "0.75rem",
            cursor: isPending ? "not-allowed" : "pointer",
            opacity: isPending ? 0.5 : 1,
            color: "var(--state-error)",
          }}
        >
          {t("admin.common.delete", "Delete")}
        </button>
      </div>
    </div>
  );
}
