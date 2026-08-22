"use client";

import { Upload, X, Link2, Plus } from "lucide-react";
import React, { useRef, useState } from "react";

import type {
  UploadArrangeAction,
  UploadArrangeState,
} from "@/features/admin/hooks/Content/useUploadArrangeState";

import { useTranslation } from "@/core/i18n/use-translation";
import { extractAudioDuration } from "@/features/admin/utils/audio-metadata";
import { resolveLinksToMetadata } from "@/features/admin/utils/resolve-import-urls";
import { Button } from "@/shared/components/ui/button";
import { InputField } from "@/shared/components/ui/input-field";

import styles from "./upload-arrange.module.css";

interface UploadArrangeUploadTabProps {
  state: UploadArrangeState;
  dispatch: React.Dispatch<UploadArrangeAction>;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const rounded = Math.round(seconds);
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function formatSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface LinkRow {
  id: string;
  value: string;
}

function newLinkRow(): LinkRow {
  return { id: crypto.randomUUID(), value: "" };
}

export function UploadArrangeUploadTab({ state, dispatch }: UploadArrangeUploadTabProps) {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [linkRows, setLinkRows] = useState<LinkRow[]>([newLinkRow()]);
  const [importingLinks, setImportingLinks] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stageFiles = async (rawFiles: File[]) => {
    const files = await Promise.all(
      rawFiles.map(async (file) => ({
        file,
        durationSeconds: await extractAudioDuration(file).catch(() => null),
      })),
    );
    dispatch({ type: "ADD_FILES", files });
  };

  const addFiles = async (fileList: FileList) => {
    const audioFiles = Array.from(fileList).filter((file) => file.type.startsWith("audio/"));
    if (audioFiles.length === 0) {
      dispatch({
        type: "SET_ERROR",
        error: t("admin.contents.listing.audioFilesOnly", "Please select audio files."),
      });
      return;
    }
    await stageFiles(audioFiles);
  };

  const setLinkRowValue = (id: string, value: string) => {
    setLinkRows((rows) => rows.map((row) => (row.id === id ? { ...row, value } : row)));
  };

  const addLinkRow = () => setLinkRows((rows) => [...rows, newLinkRow()]);

  const removeLinkRow = (id: string) => {
    setLinkRows((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));
  };

  const handleAddFromLinks = async () => {
    const lines: string[] = [];
    for (const row of linkRows) {
      if (row.value.trim()) lines.push(row.value);
    }
    if (lines.length === 0) return;

    setImportingLinks(true);
    try {
      const { items, errors } = await resolveLinksToMetadata(lines);
      if (items.length > 0) {
        dispatch({ type: "ADD_URL_ITEMS", items });
        setLinkRows([newLinkRow()]);
      }
      if (errors.length > 0) {
        dispatch({
          type: "SET_ERROR",
          error: errors.map((e) => `${e.input}: ${e.message}`).join("\n"),
        });
      }
    } finally {
      setImportingLinks(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      void addFiles(e.dataTransfer.files);
    }
  };

  const isSingle = state.existing?.format === "single";

  return (
    <div>
      <div
        role="presentation"
        className={`${styles.dropzone} ${dragActive ? styles.dragActive : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          data-testid="audio-files-input"
          ref={fileInputRef}
          type="file"
          className={styles.fileInput}
          accept="audio/*"
          multiple={!isSingle}
          aria-label={t("admin.contents.listing.selectAudioFiles", "Select audio files")}
          onChange={(e) => {
            if (e.target.files?.length) {
              void addFiles(e.target.files);
              e.target.value = "";
            }
          }}
        />
        <Upload className={styles.dropzoneIcon} size={36} />
        <p className={styles.dropzoneText}>
          {isSingle
            ? t("admin.contents.listing.audioDropzone", "Drag & drop an audio file here")
            : t("admin.contents.listing.audioDropzoneMulti", "Drag & drop audio files here")}
        </p>
        <p className={styles.fileMeta}>
          {t(
            "admin.contents.listing.filenameHint",
            'Files named "NNN Title" are ordered by their number automatically',
          )}
        </p>
      </div>

      <div className={styles.linkSection}>
        {linkRows.map((row) => (
          <div key={row.id} className={styles.linkRow}>
            <InputField
              type="url"
              value={row.value}
              onChange={(value) => setLinkRowValue(row.id, value)}
              placeholder={t(
                "admin.contents.listing.pasteLinkPlaceholder",
                "https://archive.org/details/... or any direct audio link",
              )}
            />
            {linkRows.length > 1 && (
              <button
                type="button"
                className={styles.iconButton}
                aria-label={t("admin.contents.listing.removeLink", "Remove link")}
                onClick={() => removeLinkRow(row.id)}
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <div className={styles.linkActions}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<Plus size={14} />}
            onClick={addLinkRow}
          >
            {t("admin.contents.listing.addAnotherLink", "Add another link")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Link2 size={14} />}
            loading={importingLinks}
            onClick={() => void handleAddFromLinks()}
          >
            {t("admin.contents.listing.addFromLinks", "Add from links")}
          </Button>
        </div>
      </div>

      {state.items.length > 0 && (
        <div className={styles.fileList}>
          {state.items.map((item) => (
            <div key={item.id} className={styles.fileRow}>
              <span
                className={`${styles.orderBadge} ${
                  item.numericPrefix === null ? styles.orderBadgeMuted : ""
                }`}
              >
                {item.numericPrefix ?? "—"}
              </span>
              <div className={styles.fileTitleInput}>
                <InputField
                  value={item.title}
                  onChange={(value) =>
                    dispatch({ type: "RENAME_ITEM", itemId: item.id, title: value })
                  }
                  placeholder={t("admin.contents.listing.itemTitle", "Title")}
                />
              </div>
              <span className={styles.fileMeta}>
                {formatDuration(item.durationSeconds)} · {formatSize(item.sizeBytes)}
              </span>
              <button
                type="button"
                className={styles.iconButton}
                aria-label={t("admin.contents.listing.removeFile", "Remove file")}
                onClick={() => dispatch({ type: "REMOVE_ITEM", itemId: item.id })}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
