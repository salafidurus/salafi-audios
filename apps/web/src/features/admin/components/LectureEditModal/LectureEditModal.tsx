"use client";

import React, { useReducer } from "react";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type {
  ScholarListItemDto,
  TopicRefDto,
  AdminListingListItemDto,
  AdminListingDetailDto,
} from "@sd/core-contracts";
import { createLecture, updateLecture } from "../../api/admin-lectures.api";
import { Modal } from "../../../../shared/components/Modal";
import styles from "./lecture-edit-modal.module.css";
import { X } from "lucide-react";

interface LectureEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lecture?: AdminListingDetailDto | null;
  initialAudioData?: {
    audioKey: string;
    durationSeconds: number;
    sizeBytes: number;
    format: string;
    filename: string;
  } | null;
}

type FormState = {
  title: string;
  slug: string;
  description: string;
  scholarId: string;
  seriesId: string;
  status: "draft" | "published" | "archived";
  orderIndex: number;
  selectedTopics: string[];
  saving: boolean;
  formError: string | null;
};

function formReducer(state: FormState, patch: Partial<FormState>): FormState {
  return { ...state, ...patch };
}

function initFormState(
  lecture: AdminListingDetailDto | null | undefined,
  initialAudioData: LectureEditModalProps["initialAudioData"],
): FormState {
  if (lecture) {
    return {
      title: lecture.title,
      slug: lecture.slug,
      description: lecture.description || "",
      scholarId: lecture.scholarId,
      seriesId: lecture.parentId || "",
      status: lecture.status as "draft" | "published" | "archived",
      orderIndex: lecture.orderIndex || 0,
      selectedTopics: lecture.topics || [],
      saving: false,
      formError: null,
    };
  }
  return {
    title: initialAudioData?.filename.replace(/\.[^/.]+$/, "") || "",
    slug: "",
    description: "",
    scholarId: "",
    seriesId: "",
    status: "draft",
    orderIndex: 0,
    selectedTopics: [],
    saving: false,
    formError: null,
  };
}

// react-doctor-disable-next-line react-doctor/no-giant-component
export function LectureEditModal({
  isOpen,
  onClose,
  onSuccess,
  lecture,
  initialAudioData,
}: LectureEditModalProps) {
  const [state, dispatch] = useReducer(formReducer, undefined, () =>
    initFormState(lecture, initialAudioData),
  );

  const {
    title,
    slug,
    description,
    scholarId,
    seriesId,
    status,
    orderIndex,
    selectedTopics,
    saving,
    formError,
  } = state;

  // react-doctor-disable-next-line react-doctor/no-derived-useState, react-doctor/rerender-state-only-in-handlers
  const [prevLecture, setPrevLecture] = React.useState(lecture);
  // react-doctor-disable-next-line react-doctor/no-derived-useState, react-doctor/rerender-state-only-in-handlers
  const [prevIsOpen, setPrevIsOpen] = React.useState(isOpen);
  if (lecture !== prevLecture || isOpen !== prevIsOpen) {
    setPrevLecture(lecture);
    setPrevIsOpen(isOpen);
    dispatch(initFormState(lecture, initialAudioData));
  }

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
  const { data: seriesData } = useApiQuery<AdminListingListItemDto[]>(
    ["series", "list", scholarId],
    () =>
      scholarId
        ? httpClient<AdminListingListItemDto[]>({
            url: `${endpoints.admin.listings.list}?scholarId=${scholarId}&format=series`,
            method: "GET",
          })
        : Promise.resolve([]),
  );

  // Autogenerate slug from title if slug is empty
  const handleTitleChange = (val: string) => {
    if (!lecture) {
      dispatch({
        title: val,
        slug: val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-"),
      });
    } else {
      dispatch({ title: val });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      dispatch({ formError: "Title is required." });
      return;
    }
    if (!scholarId) {
      dispatch({ formError: "Scholar is required." });
      return;
    }

    dispatch({ saving: true, formError: null });

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
          dispatch({ formError: "Audio file key is required for creation.", saving: false });
          return;
        }
        await createLecture({
          title,
          slug: slug || undefined,
          scholarId,
          parentId: seriesId || undefined,
          topics: selectedTopics,
          format: "single",
          audioKey: initialAudioData.audioKey,
          durationSeconds: initialAudioData.durationSeconds,
          sizeBytes: initialAudioData.sizeBytes,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      dispatch({ formError: (err as Error)?.message || "Failed to save lecture details." });
    } finally {
      dispatch({ saving: false });
    }
  };

  const handleTopicToggle = (topicId: string) => {
    dispatch({
      selectedTopics: selectedTopics.includes(topicId)
        ? selectedTopics.filter((id) => id !== topicId)
        : [...selectedTopics, topicId],
    });
  };

  const scholars = scholarsData?.scholars ?? [];
  const topics = topicsData ?? [];
  const series = seriesData ?? [];
  const selectedTopicsSet = new Set(selectedTopics);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lecture ? "Edit Lecture Details" : "New Lecture Details"}
      size="xl"
      footer={
        <>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            type="submit"
            className={styles.saveBtn}
            disabled={saving}
            form="lecture-edit-form"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </>
      }
    >
      <form id="lecture-edit-form" onSubmit={handleSave} className={styles.form}>
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
            onChange={(e) => dispatch({ slug: e.target.value })}
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
            onChange={(e) => dispatch({ description: e.target.value })}
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
              onChange={(e) => dispatch({ scholarId: e.target.value })}
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
              onChange={(e) => dispatch({ seriesId: e.target.value })}
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
              onChange={(e) =>
                dispatch({ status: e.target.value as "draft" | "published" | "archived" })
              }
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
              onChange={(e) => dispatch({ orderIndex: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <span className={styles.label}>Topics</span>
          <div className={styles.topicsGrid}>
            {topics.map((t) => (
              <label key={t.id} className={styles.topicCheckboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedTopicsSet.has(t.id)}
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
      </form>
    </Modal>
  );
}
