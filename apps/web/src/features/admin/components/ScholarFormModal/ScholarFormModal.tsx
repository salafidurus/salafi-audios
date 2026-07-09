"use client";

import { useState } from "react";
import Image from "next/image";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { FormSection } from "@/features/admin/components/FormSection";
import type { CreateScholarDto } from "@sd/core-contracts";
import styles from "./scholar-form-modal.module.css";

// Minimal edit data extracted from ScholarListItemDto
export interface ScholarForEdit {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  imageUrl?: string | null;
  isKibar?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  country?: string | null;
  mainLanguage?: "en" | "ar" | null;
  socialTwitter?: string | null;
  socialTelegram?: string | null;
  socialYoutube?: string | null;
  socialWebsite?: string | null;
}

export interface ScholarFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateScholarDto) => Promise<void>;
  scholar?: ScholarForEdit | null;
}

function getInitialFormData(scholar: ScholarForEdit | null): CreateScholarDto {
  if (scholar) {
    return {
      name: scholar.name,
      slug: scholar.slug,
      bio: scholar.bio ?? "",
      imageUrl: scholar.imageUrl ?? "",
      isKibar: scholar.isKibar ?? false,
      isFeatured: scholar.isFeatured ?? false,
      isActive: scholar.isActive ?? true,
      country: scholar.country ?? "",
      mainLanguage: scholar.mainLanguage ?? undefined,
      socialTwitter: scholar.socialTwitter ?? "",
      socialTelegram: scholar.socialTelegram ?? "",
      socialYoutube: scholar.socialYoutube ?? "",
      socialWebsite: scholar.socialWebsite ?? "",
    };
  }
  return {
    name: "",
    slug: "",
    bio: "",
    imageUrl: "",
    isKibar: false,
    isFeatured: false,
    isActive: true,
    country: "",
    mainLanguage: undefined,
    socialTwitter: "",
    socialTelegram: "",
    socialYoutube: "",
    socialWebsite: "",
  };
}

export function ScholarFormModal({ isOpen, onClose, onSave, scholar }: ScholarFormModalProps) {
  const [formData, setFormData] = useState<CreateScholarDto>(() =>
    getInitialFormData(scholar ?? null),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!scholar;

  // Auto-generate slug from name (for new scholars only)
  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      // Only auto-slug for new scholars
      slug: !isEditing
        ? value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
        : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      setError("Name and slug are required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Scholar" : "Add Scholar"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <FormSection title="Basic Information">
          <div className={styles.field}>
            <label className={styles.label}>Name *</label>
            <input
              type="text"
              className={styles.input}
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Scholar name"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Slug *</label>
            <input
              type="text"
              className={styles.input}
              value={formData.slug}
              onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
              placeholder="scholar-slug"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Bio</label>
            <textarea
              className={styles.textarea}
              value={formData.bio ?? ""}
              onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Brief biography..."
              rows={4}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Image URL</label>
            <input
              type="url"
              className={styles.input}
              value={formData.imageUrl ?? ""}
              onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))}
              placeholder="https://..."
            />
            {formData.imageUrl && (
              <div className={styles.imagePreview}>
                <Image
                  src={formData.imageUrl}
                  alt="Preview"
                  width={200}
                  height={200}
                  style={{ objectFit: "contain" }}
                  className={styles.previewImage}
                />
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Location & Language">
          <div className={styles.field}>
            <label className={styles.label}>Country</label>
            <input
              type="text"
              className={styles.input}
              value={formData.country ?? ""}
              onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))}
              placeholder="e.g., Saudi Arabia, Egypt"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Main Language</label>
            <select
              className={styles.select}
              value={formData.mainLanguage ?? ""}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  mainLanguage: e.target.value ? (e.target.value as "en" | "ar") : undefined,
                }))
              }
            >
              <option value="">-- Select Language --</option>
              <option value="en">English</option>
              <option value="ar">Arabic (عربي)</option>
            </select>
          </div>
        </FormSection>

        <FormSection title="Social Media">
          <div className={styles.field}>
            <label className={styles.label}>Twitter</label>
            <input
              type="url"
              className={styles.input}
              value={formData.socialTwitter ?? ""}
              onChange={(e) => setFormData((p) => ({ ...p, socialTwitter: e.target.value }))}
              placeholder="https://twitter.com/..."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Telegram</label>
            <input
              type="url"
              className={styles.input}
              value={formData.socialTelegram ?? ""}
              onChange={(e) => setFormData((p) => ({ ...p, socialTelegram: e.target.value }))}
              placeholder="https://t.me/..."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>YouTube</label>
            <input
              type="url"
              className={styles.input}
              value={formData.socialYoutube ?? ""}
              onChange={(e) => setFormData((p) => ({ ...p, socialYoutube: e.target.value }))}
              placeholder="https://youtube.com/..."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Website</label>
            <input
              type="url"
              className={styles.input}
              value={formData.socialWebsite ?? ""}
              onChange={(e) => setFormData((p) => ({ ...p, socialWebsite: e.target.value }))}
              placeholder="https://..."
            />
          </div>
        </FormSection>

        <FormSection title="Settings">
          <div className={styles.checkboxGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.isKibar ?? false}
                onChange={(e) => setFormData((p) => ({ ...p, isKibar: e.target.checked }))}
              />
              <span>Kibar Scholar</span>
            </label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.isFeatured ?? false}
                onChange={(e) => setFormData((p) => ({ ...p, isFeatured: e.target.checked }))}
              />
              <span>Featured</span>
            </label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.isActive ?? true}
                onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
              />
              <span>Active</span>
            </label>
          </div>
        </FormSection>

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            {isEditing ? "Save Changes" : "Add Scholar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
