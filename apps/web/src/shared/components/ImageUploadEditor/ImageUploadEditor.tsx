/** Documents this module's responsibility and public boundary. */
"use client";

import { Edit2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";

import styles from "./image-upload-editor.module.css";

const ALLOWED_FORMATS = ["png", "jpg", "jpeg"];
const MAX_SIZE_MB = 1;

interface ImageUploadEditorProps {
  imageUrl?: string | null;
  onImageStaged: (file: File | null, preview: string | null) => void;
  uploadLabel?: string;
  changeLabel?: string;
  selectLabel?: string;
  altText?: string;
}

function getImageValidationError(file: File, t: ReturnType<typeof useTranslation>["t"]) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_FORMATS.includes(ext)) {
    return t("imageUpload.errorFileExt", "Only PNG, JPG, and JPEG images are allowed");
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_SIZE_MB) {
    return t("imageUpload.errorFileSize", {
      defaultValue: `Image must be less than ${MAX_SIZE_MB}MB (current: ${sizeMB.toFixed(1)}MB)`,
      maxSizeMB: MAX_SIZE_MB,
      current: sizeMB.toFixed(1),
    });
  }

  return null;
}

function ImagePreview({
  preview,
  altText,
  changeLabel,
  selectLabel,
  uploadLabel,
  onClick,
}: {
  preview: string | null;
  altText: string;
  changeLabel: string;
  selectLabel: string;
  uploadLabel: string;
  onClick: () => void;
}) {
  if (preview) {
    return (
      <div className={styles.imageContainer}>
        <Image src={preview} alt={altText} width={120} height={120} className={styles.image} />
        <button
          type="button"
          className={styles.editOverlay}
          onClick={onClick}
          aria-label={changeLabel}
        >
          <Edit2 size={20} />
        </button>
      </div>
    );
  }

  return (
    <button type="button" className={styles.placeholder} onClick={onClick} aria-label={selectLabel}>
      <div className={styles.placeholderContent}>
        <Edit2 size={24} />
        <span className={styles.placeholderText}>{uploadLabel}</span>
      </div>
    </button>
  );
}

export function ImageUploadEditor({
  imageUrl,
  onImageStaged,
  uploadLabel = "Upload image",
  changeLabel = "Change image",
  selectLabel = "Select image",
  altText = "Uploaded image",
}: ImageUploadEditorProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(imageUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const validationError = getImageValidationError(file, t);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create object URL preview for staged file
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onImageStaged(file, objectUrl);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.container}>
      <div className={styles.imageWrapper}>
        <ImagePreview
          preview={preview}
          altText={altText}
          changeLabel={changeLabel}
          selectLabel={selectLabel}
          uploadLabel={uploadLabel}
          onClick={handleClick}
        />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={`.${ALLOWED_FORMATS.join(", .")}`}
        style={{ display: "none" }}
        aria-label={selectLabel}
      />

      {error && (
        <div className={styles.error} role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
