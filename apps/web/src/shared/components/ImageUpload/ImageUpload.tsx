"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Upload, X, AlertCircle, Loader } from "lucide-react";
import styles from "./image-upload.module.css";

export interface ImageUploadProps {
  value?: string; // Current image URL
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  maxSizeMB?: number;
  disabled?: boolean;
  slug?: string; // For slug-based naming (e.g., scholar images)
}

export function ImageUpload({
  value,
  onChange,
  onError,
  maxSizeMB = 1, // Default 1MB for scholar images
  disabled = false,
  slug,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        const error = "Please upload an image file";
        setUploadError(error);
        onError?.(error);
        return;
      }

      // Additional restriction for slug-based uploads (scholar images)
      if (slug) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        if (!["png", "jpg", "jpeg"].includes(ext)) {
          const error = "Only PNG, JPG, and JPEG images are allowed";
          setUploadError(error);
          onError?.(error);
          return;
        }
      }

      // Validate file size
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        const error = `Image must be less than ${maxSizeMB}MB (current: ${sizeMB.toFixed(1)}MB)`;
        setUploadError(error);
        onError?.(error);
        return;
      }

      setUploadError(null);
      setIsUploading(true);

      try {
        // Create preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        if (slug) {
          // Request presigned URL from backend
          const presignedResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/media/presigned-url`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                filename: file.name,
                contentType: file.type,
                purpose: "image",
                slug,
              }),
            },
          );

          if (!presignedResponse.ok) {
            throw new Error("Failed to get upload URL");
          }

          const { uploadUrl, publicUrl } = await presignedResponse.json();

          // Upload file directly to R2 using presigned URL
          const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });

          if (!uploadResponse.ok) {
            throw new Error("Upload to R2 failed");
          }

          // Clean up object URL
          URL.revokeObjectURL(objectUrl);

          // Set the permanent URL
          setPreviewUrl(publicUrl);
          onChange(publicUrl);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        setUploadError(errorMessage);
        onError?.(errorMessage);
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
      }
    },
    [maxSizeMB, onChange, onError, slug],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) {
        return;
      }

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, handleFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setUploadError(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onChange]);

  return (
    <div className={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className={styles.hiddenInput}
        disabled={disabled}
      />

      {!previewUrl ? (
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dragging : ""} ${disabled ? styles.disabled : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Upload image"
        >
          {isUploading ? (
            <div className={styles.uploadingState}>
              <Loader size={32} className={styles.spinner} />
              <p>Uploading...</p>
            </div>
          ) : (
            <>
              <Upload size={32} className={styles.uploadIcon} />
              <p className={styles.dropText}>
                <strong>Click to upload</strong> or drag and drop
              </p>
              <p className={styles.dropHint}>PNG, JPG, GIF up to {maxSizeMB}MB</p>
            </>
          )}
        </div>
      ) : (
        <div className={styles.previewContainer}>
          <div className={styles.preview}>
            <Image
              src={previewUrl}
              alt="Preview"
              width={240}
              height={240}
              style={{ objectFit: "contain" }}
              className={styles.previewImage}
            />
            {!disabled && (
              <button
                type="button"
                className={styles.removeButton}
                onClick={handleRemove}
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {uploadError && (
        <div className={styles.error} role="alert">
          <AlertCircle size={16} />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
