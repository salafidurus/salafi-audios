"use client";

import React, { useRef, useState } from "react";
import { getPresignedUrl, uploadToR2 } from "../../api/admin-lectures.api";
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

function extractMetadata(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const audio = new Audio();
    audio.src = objectUrl;
    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(objectUrl);
      resolve(audio.duration);
    });
    audio.addEventListener("error", () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load audio metadata"));
    });
  });
}

export function AudioUploader({ onUploadComplete }: AudioUploaderProps) {
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

  const isClickable = uploadState === "idle" || uploadState === "error";

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
              <p className={styles.primaryText}>Drag & drop an audio file here</p>
              <button type="button" className={styles.secondaryText} onClick={onButtonClick}>
                or click to browse files
              </button>
            </>
          )}

          {uploadState === "extracting" && (
            <>
              <FileAudio className={`${styles.icon} ${styles.spin}`} size={40} />
              <p className={styles.primaryText}>Analyzing audio file...</p>
              <p className={styles.fileName}>{fileName}</p>
            </>
          )}

          {uploadState === "uploading" && (
            <>
              <Upload className={`${styles.icon} ${styles.pulse}`} size={40} />
              <p className={styles.primaryText}>Uploading to storage...</p>
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
              <button type="button" className={styles.secondaryText} onClick={onButtonClick}>
                Click to try again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
