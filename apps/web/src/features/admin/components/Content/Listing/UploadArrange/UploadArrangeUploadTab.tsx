"use client";

import React, { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { useTranslation } from "@/core/i18n/use-translation";
import { InputField } from "@/shared/components/InputField";
import { extractAudioDuration } from "@/features/admin/utils/audio-metadata";
import type {
  UploadArrangeAction,
  UploadArrangeState,
} from "@/features/admin/hooks/Content/useUploadArrangeState";
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

export function UploadArrangeUploadTab({ state, dispatch }: UploadArrangeUploadTabProps) {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = async (fileList: FileList) => {
    const audioFiles = Array.from(fileList).filter((file) => file.type.startsWith("audio/"));
    if (audioFiles.length === 0) {
      dispatch({
        type: "SET_ERROR",
        error: t("admin.contents.listing.audioFilesOnly", "Please select audio files."),
      });
      return;
    }
    const files = await Promise.all(
      audioFiles.map(async (file) => ({
        file,
        durationSeconds: await extractAudioDuration(file).catch(() => null),
      })),
    );
    dispatch({ type: "ADD_FILES", files });
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
