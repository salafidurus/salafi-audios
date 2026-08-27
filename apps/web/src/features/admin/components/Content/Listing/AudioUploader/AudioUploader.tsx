"use client";

import { Upload, FileAudio, CheckCircle, AlertCircle, Link2 } from "lucide-react";
import React, { useRef, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { getPresignedUrl, uploadToR2 } from "@/features/admin/api/admin-lectures.api";
import { extractAudioDuration } from "@/features/admin/utils/audio-metadata";
import { importSingleLineWithProgress } from "@/features/admin/utils/resolve-import-urls";
import { Button } from "@/shared/components/ui/button";
import { InputField } from "@/shared/components/ui/input-field";

import styles from "./audio-uploader.module.css";

type UploadState = "idle" | "importing" | "extracting" | "uploading" | "success" | "error";
type UploadMode = "file" | "link";

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getErrorMessage(error: Error | null, fallback: string): string {
  return error?.message ?? fallback;
}

interface AudioUploaderProps {
  onUploadComplete: (result: {
    audioKey: string;
    durationSeconds: number;
    sizeBytes: number;
    format: string;
    filename: string;
  }) => void;
}

type ModeToggleProps = {
  mode: UploadMode;
  setMode: (mode: UploadMode) => void;
  reset: () => void;
  t: (key: string, fallback: string) => string;
};

function UploadModeToggle({ mode, setMode, reset, t }: ModeToggleProps) {
  const selectMode = (nextMode: UploadMode) => {
    setMode(nextMode);
    reset();
  };

  return (
    <div className={styles.modeToggle}>
      <Button
        type="button"
        variant={mode === "file" ? "primary" : "ghost"}
        size="sm"
        onClick={() => selectMode("file")}
      >
        {t("admin.contents.listing.uploadFileMode", "Upload file")}
      </Button>
      <Button
        type="button"
        variant={mode === "link" ? "primary" : "ghost"}
        size="sm"
        icon={<Link2 size={14} />}
        onClick={() => selectMode("link")}
      >
        {t("admin.contents.listing.pasteLinkMode", "Paste link")}
      </Button>
    </div>
  );
}

export function AudioUploader({ onUploadComplete }: AudioUploaderProps) {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [mode, setMode] = useState<UploadMode>("file");
  const [linkValue, setLinkValue] = useState("");
  const [downloadProgress, setDownloadProgress] = useState<{
    loaded: number;
    total: number | null;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      setError("Please select an audio file.");
      setUploadState("error");
      return;
    }

    setFileName(file.name);
    setUploadState("extracting");
    setError(null);

    try {
      // Step 1: Extract duration using HTML5 Audio (prevents loading whole file to RAM)
      const durationSeconds = await extractAudioDuration(file);

      setUploadState("uploading");
      // Step 2: Fetch presigned URL
      const { uploadUrl, objectKey } = await getPresignedUrl({
        filename: file.name,
        contentType: file.type,
        purpose: "audio",
      });

      // Step 3: Direct upload to Cloudflare R2
      await uploadToR2(uploadUrl, file, file.type);

      setUploadState("success");
      onUploadComplete({
        audioKey: objectKey,
        durationSeconds: Math.round(durationSeconds),
        sizeBytes: file.size,
        format: file.type,
        filename: file.name,
      });
    } catch (err) {
      setError(
        getErrorMessage(err instanceof Error ? err : null, "An error occurred during file upload."),
      );
      setUploadState("error");
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = linkValue.trim();
    if (!url) return;

    setUploadState("importing");
    setError(null);
    setFileName(null);
    setDownloadProgress(null);

    try {
      const { files, errors } = await importSingleLineWithProgress(url, (loaded, total) =>
        setDownloadProgress({ loaded, total }),
      );
      if (files.length > 1) {
        throw new Error(
          "This link resolved to multiple files — use the batch Upload & Arrange flow instead.",
        );
      }
      const [file] = files;
      if (!file) {
        throw new Error(errors[0]?.message ?? "Couldn't import this link.");
      }
      await handleFile(file);
    } catch (err) {
      setError(
        getErrorMessage(
          err instanceof Error ? err : null,
          "An error occurred while importing this link.",
        ),
      );
      setUploadState("error");
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const showModeToggle = uploadState === "idle" || uploadState === "error";

  return (
    <div className={styles.container}>
      {showModeToggle && (
        <UploadModeToggle
          mode={mode}
          setMode={setMode}
          reset={() => {
            setUploadState("idle");
            setError(null);
          }}
          t={t}
        />
      )}

      {mode === "link" && uploadState === "idle" ? (
        <form className={styles.linkForm} onSubmit={handleLinkSubmit}>
          <InputField
            type="url"
            value={linkValue}
            onChange={setLinkValue}
            placeholder="https://archive.org/download/.../lecture.mp3"
          />
          <Button type="submit" variant="primary" size="sm">
            {t("admin.contents.listing.importLink", "Import")}
          </Button>
        </form>
      ) : (
        <div
          role="presentation"
          className={`${styles.dropzone} ${dragActive ? styles.dragActive : ""} ${
            styles[`state-${uploadState}`]
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            data-testid="audio-file-input"
            ref={fileInputRef}
            type="file"
            className={styles.fileInput}
            accept="audio/*"
            aria-label="Select audio file"
            onChange={handleChange}
          />

          <div className={styles.content}>
            {uploadState === "idle" && (
              <>
                <Upload className={styles.icon} size={40} />
                <p className={styles.primaryText}>
                  {t("admin.contents.listing.audioDropzone", "Drag & drop an audio file here")}
                </p>
                <Button variant="ghost" className={styles.secondaryText} onClick={onButtonClick}>
                  {t("admin.contents.listing.clickToBrowse", "or click to browse files")}
                </Button>
              </>
            )}

            {uploadState === "importing" && (
              <>
                <Link2 className={`${styles.icon} ${styles.spin}`} size={40} />
                <p className={styles.primaryText}>
                  {t(
                    "admin.contents.listing.importingFromLink",
                    "Downloading from link… this can take a while for large files.",
                  )}
                </p>
                {downloadProgress && (
                  <p className={styles.fileName}>
                    {downloadProgress.total
                      ? `${formatBytes(downloadProgress.loaded)} / ${formatBytes(downloadProgress.total)}`
                      : formatBytes(downloadProgress.loaded)}
                  </p>
                )}
              </>
            )}

            {uploadState === "extracting" && (
              <>
                <FileAudio className={`${styles.icon} ${styles.spin}`} size={40} />
                <p className={styles.primaryText}>
                  {t("admin.contents.listing.extractingAudio", "Analyzing audio file...")}
                </p>
                <p className={styles.fileName}>{fileName}</p>
              </>
            )}

            {uploadState === "uploading" && (
              <>
                <Upload className={`${styles.icon} ${styles.pulse}`} size={40} />
                <p className={styles.primaryText}>
                  {t("admin.contents.listing.uploadingStorage", "Uploading to storage...")}
                </p>
                <p className={styles.fileName}>{fileName}</p>
              </>
            )}

            {uploadState === "success" && (
              <>
                <CheckCircle className={styles.iconSuccess} size={40} />
                <p className={styles.primaryText}>Upload complete!</p>
                <p className={styles.fileName}>{fileName}</p>
              </>
            )}

            {uploadState === "error" && (
              <>
                <AlertCircle className={styles.iconError} size={40} />
                <p className={styles.primaryText}>Upload failed</p>
                <p className={styles.errorMessage}>{error}</p>
                <Button
                  variant="ghost"
                  className={styles.secondaryText}
                  onClick={() => (mode === "file" ? onButtonClick() : setUploadState("idle"))}
                >
                  Click to try again
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
