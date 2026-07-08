"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import type { CreateScholarDto } from "@sd/core-contracts";
import styles from "./scholar-form-modal.module.css";

// Minimal edit data extracted from ScholarListItemDto
export interface ScholarForEdit {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  isKibar?: boolean;
}

export interface ScholarFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateScholarDto) => Promise<void>;
  scholar?: ScholarForEdit | null;
}

const initialFormData: CreateScholarDto = {
  name: "",
  slug: "",
  bio: "",
  imageUrl: "",
  isKibar: false,
  isFeatured: false,
  isActive: true,
};

export function ScholarFormModal({ isOpen, onClose, onSave, scholar }: ScholarFormModalProps) {
  const [formData, setFormData] = useState<CreateScholarDto>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!scholar;

  useEffect(() => {
    if (scholar) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: scholar.name,
        slug: scholar.slug,
        bio: "",
        imageUrl: scholar.imageUrl ?? "",
        isKibar: scholar.isKibar ?? false,
        isFeatured: false,
        isActive: true,
      });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(initialFormData);
    }
    setError(null);
  }, [scholar, isOpen]);

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
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label className={styles.label}>Name *</label>
          <input
            type="text"
            className={styles.input}
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Scholar name"
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
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Bio</label>
          <textarea
            className={styles.textarea}
            value={formData.bio ?? ""}
            onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
            placeholder="Brief biography..."
            rows={3}
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
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={formData.isKibar ?? false}
              onChange={(e) => setFormData((p) => ({ ...p, isKibar: e.target.checked }))}
            />
            <span>Kibar</span>
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

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
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
