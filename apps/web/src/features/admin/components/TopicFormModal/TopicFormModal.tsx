"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import type { UpsertTopicDto } from "@sd/core-contracts";
import styles from "./topic-form-modal.module.css";

export interface TopicForEdit {
  slug: string;
  name: string;
  parentSlug?: string | null;
}

export interface TopicFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpsertTopicDto) => Promise<void>;
  topic?: TopicForEdit | null;
}

export function TopicFormModal({ isOpen, onClose, onSave, topic }: TopicFormModalProps) {
  const [formData, setFormData] = useState<UpsertTopicDto>({ name: "", slug: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!topic;

  useEffect(() => {
    if (topic) {
      setFormData({
        name: topic.name,
        slug: topic.slug,
        parentSlug: topic.parentSlug ?? undefined,
      });
    } else {
      setFormData({ name: "", slug: "" });
    }
    setError(null);
  }, [topic, isOpen]);

  // Auto-generate slug from name (for new topics only)
  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
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
      title={isEditing ? "Edit Topic" : "Add Topic"}
      size="sm"
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
            placeholder="Topic name"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Slug *</label>
          <input
            type="text"
            className={styles.input}
            value={formData.slug}
            onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
            placeholder="topic-slug"
          />
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            {isEditing ? "Save" : "Add Topic"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
