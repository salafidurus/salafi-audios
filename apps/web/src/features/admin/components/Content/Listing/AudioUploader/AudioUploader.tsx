"use client";

import React, { useRef, useState } from "react";
import { getPresignedUrl, uploadToR2 } from "@/features/admin/api/admin-lectures.api";
import { Button } from "@/shared/components/Button";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./audio-uploader.module.css";
import { Upload, FileAudio, CheckCircle, AlertCircle } from "lucide-react";

type UploadState = "idle" | "extracting" | "uploading" | "success" | "error";

interface AudioUploaderProps {
  onUploadComplete: (result: {
    audioKey: string;
    durationSeconds: number;
    sizeBytes: number;
    format: string;
    filename: string;
  }) => void;
}

async function extractMetadata(file: File): Promise<number> {
  let duration = 0;
  let error: Error | null = null;

  const objectUrl = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => {
      const audio = new Audio();
      audio.src = objectUrl;
      let isSettled = false;

      const cleanup = () => {
        audio.removeEventListener("loadedmetadata", onLoadedMetadata);
        audio.removeEventListener("error", onError);
      };

      const onLoadedMetadata = () => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timeoutId);
        cleanup();
        duration = audio.duration;
        resolve();
      };

      const onError = () => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timeoutId);
        cleanup();
        reject(new Error("Failed to load audio metadata"));
      };

      const timeoutId = setTimeout(() => {
        if (isSettled) return;
        isSettled = true;
        cleanup();
        reject(new Error("Audio metadata loading timeout"));
      }, 5000);

      audio.addEventListener("loadedmetadata", onLoadedMetadata);
      audio.addEventListener("error", onError);
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  return duration;
}

export function AudioUploader({ onUploadComplete }: AudioUploaderProps) {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
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
      const durationSeconds = await extractMetadata(file);

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
      setError((err as Error)?.message || "An error occurred during file upload.");
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

  return (
    <div className={styles.container}>
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
              <Button variant="ghost" className={styles.secondaryText} onClick={onButtonClick}>
                Click to try again
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
