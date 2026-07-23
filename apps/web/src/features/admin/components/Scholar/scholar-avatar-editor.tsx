"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Edit2, AlertCircle } from "lucide-react";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./scholar-avatar-editor.module.css";

const ALLOWED_FORMATS = ["png", "jpg", "jpeg"];
const MAX_SIZE_MB = 1;

interface ScholarAvatarEditorProps {
  imageUrl?: string | null;
  onImageStaged: (file: File | null, preview: string | null) => void;
}

export function ScholarAvatarEditor({ imageUrl, onImageStaged }: ScholarAvatarEditorProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(imageUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_FORMATS.includes(ext)) {
      setError(t("imageUpload.errorFileExt", "Only PNG, JPG, and JPEG images are allowed"));
      return;
    }

    // Validate file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
      setError(
        t("imageUpload.errorFileSize", {
          defaultValue: `Image must be less than ${MAX_SIZE_MB}MB (current: ${sizeMB.toFixed(1)}MB)`,
          maxSizeMB: MAX_SIZE_MB,
          current: sizeMB.toFixed(1),
        }),
      );
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
        {preview ? (
          <div className={styles.imageContainer}>
            <Image
              src={preview}
              alt={t("admin.scholars.avatarAlt", "Scholar avatar")}
              width={120}
              height={120}
              className={styles.image}
            />
            <button
              type="button"
              className={styles.editOverlay}
              onClick={handleClick}
              aria-label={t("admin.scholars.changeAvatar", "Change avatar")}
            >
              <Edit2 size={20} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.placeholder}
            onClick={handleClick}
            aria-label={t("admin.scholars.uploadAvatar", "Upload avatar")}
          >
            <div className={styles.placeholderContent}>
              <Edit2 size={24} />
              <span className={styles.placeholderText}>
                {t("admin.scholars.uploadAvatar", "Upload avatar")}
              </span>
            </div>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={`.${ALLOWED_FORMATS.join(", .")}`}
        style={{ display: "none" }}
        aria-label={t("admin.scholars.selectAvatar", "Select avatar image")}
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
