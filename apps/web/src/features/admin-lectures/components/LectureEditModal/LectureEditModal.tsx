"use client";

import React, { useEffect, useState } from "react";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type {
  ScholarListItemDto,
  TopicRefDto,
  AdminSeriesListItemDto,
  AdminLectureDetailDto,
} from "@sd/core-contracts";
import { createLecture, updateLecture } from "../../api/admin-lectures.api";
import styles from "./lecture-edit-modal.module.css";
import { X } from "lucide-react";

interface LectureEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lecture?: AdminLectureDetailDto | null;
  initialAudioData?: {
    audioKey: string;
    durationSeconds: number;
    sizeBytes: number;
    format: string;
    filename: string;
  } | null;
}

export function LectureEditModal({
  isOpen,
  onClose,
  onSuccess,
  lecture,
  initialAudioData,
}: LectureEditModalProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [scholarId, setScholarId] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch scholars for dropdown
  const { data: scholarsData } = useApiQuery<{ scholars: ScholarListItemDto[] }>(
    queryKeys.scholars.list(),
    () =>
      httpClient<{ scholars: ScholarListItemDto[] }>({
        url: endpoints.scholars.list,
        method: "GET",
      }),
  );

  // Fetch topics for multi-select
  const { data: topicsData } = useApiQuery<TopicRefDto[]>(queryKeys.topics.list(), () =>
    httpClient<TopicRefDto[]>({ url: endpoints.topics.list, method: "GET" }),
  );

  // Fetch series for dropdown (filtered by scholarId)
  const { data: seriesData } = useApiQuery<AdminSeriesListItemDto[]>(
    ["series", "list", scholarId],
    () =>
      scholarId
        ? httpClient<AdminSeriesListItemDto[]>({
            url: `${endpoints.admin.series.list}?scholarId=${scholarId}`,
            method: "GET",
          })
        : Promise.resolve([]),
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (lecture) {
      setTitle(lecture.title);
      setSlug(lecture.slug);
      setDescription(lecture.description || "");
      setScholarId(lecture.scholarId);
      setSeriesId(lecture.seriesId || "");
      setStatus(lecture.status as "draft" | "published" | "archived");
      setOrderIndex(lecture.orderIndex || 0);
      setSelectedTopics(lecture.topics || []);
    } else {
      // Create mode
      setTitle(initialAudioData?.filename.replace(/\.[^/.]+$/, "") || "");
      setSlug("");
      setDescription("");
      setScholarId("");
      setSeriesId("");
      setStatus("draft");
      setOrderIndex(0);
      setSelectedTopics([]);
    }
    setFormError(null);
  }, [lecture, initialAudioData, isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Autogenerate slug from title if slug is empty
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!lecture) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-"),
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!scholarId) {
      setFormError("Scholar is required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (lecture) {
        // Edit mode
        await updateLecture(lecture.id, {
          title,
          description,
          status,
          orderIndex: Number(orderIndex),
        });
      } else {
        // Create mode
        if (!initialAudioData) {
          setFormError("Audio file key is required for creation.");
          setSaving(false);
          return;
        }
        await createLecture({
          title,
          slug: slug || undefined,
          scholarId,
          seriesId: seriesId || undefined,
          topics: selectedTopics,
          audioKey: initialAudioData.audioKey,
          durationSeconds: initialAudioData.durationSeconds,
          sizeBytes: initialAudioData.sizeBytes,
          format: initialAudioData.format,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setFormError((err as Error)?.message || "Failed to save lecture details.");
    } finally {
      setSaving(false);
    }
  };

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId],
    );
  };

  if (!isOpen) return null;

  const scholars = scholarsData?.scholars ?? [];
  const topics = topicsData ?? [];
  const series = seriesData ?? [];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {lecture ? "Edit Lecture Details" : "New Lecture Details"}
          </h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className={styles.form}>
          {formError && <div className={styles.errorBanner}>{formError}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="lecture-title" className={styles.label}>
              Title
            </label>
            <input
              id="lecture-title"
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lecture-slug" className={styles.label}>
              Slug
            </label>
            <input
              id="lecture-slug"
              type="text"
              className={styles.input}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Auto-generated if left blank"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lecture-description" className={styles.label}>
              Description
            </label>
            <textarea
              id="lecture-description"
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="lecture-scholar" className={styles.label}>
                Scholar
              </label>
              <select
                id="lecture-scholar"
                className={styles.select}
                value={scholarId}
                onChange={(e) => setScholarId(e.target.value)}
                required
                disabled={!!lecture}
              >
                <option value="">Select Scholar</option>
                {scholars.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lecture-series" className={styles.label}>
                Series
              </label>
              <select
                id="lecture-series"
                className={styles.select}
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                disabled={!!lecture}
              >
                <option value="">Select Series (Optional)</option>
                {series.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="lecture-status" className={styles.label}>
                Status
              </label>
              <select
                id="lecture-status"
                className={styles.select}
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published" | "archived")}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lecture-order" className={styles.label}>
                Order Index
              </label>
              <input
                id="lecture-order"
                type="number"
                className={styles.input}
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Topics</label>
            <div className={styles.topicsGrid}>
              {topics.map((t) => (
                <label key={t.id} className={styles.topicCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(t.id)}
                    onChange={() => handleTopicToggle(t.id)}
                    className={styles.checkbox}
                    disabled={!!lecture}
                  />
                  <span>{t.name}</span>
                </label>
              ))}
              {topics.length === 0 && <span className={styles.noData}>No topics available</span>}
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
