"use client";

import React, { useReducer } from "react";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type {
  ScholarListItemDto,
  TopicRefDto,
  AdminListingListItemDto,
  AdminListingDetailDto,
} from "@sd/core-contracts";
import { validateLectureStatus } from "@/shared/types/form-types";
import { createLecture, updateLecture } from "../../api/admin-lectures.api";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/Dropdown";
import styles from "./listing-modal.module.css";

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  listing?: AdminListingDetailDto | null;
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
  listing: AdminListingDetailDto | null | undefined,
  initialAudioData: ListingModalProps["initialAudioData"],
): FormState {
  if (listing) {
    return {
      title: listing.title,
      slug: listing.slug,
      description: listing.description || "",
      scholarId: listing.scholarId,
      seriesId: listing.parentId || "",
      status: listing.status as "draft" | "published" | "archived",
      orderIndex: listing.orderIndex || 0,
      selectedTopics: listing.topics || [],
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

export function ListingModal({
  isOpen,
  onClose,
  onSuccess,
  listing,
  initialAudioData,
}: ListingModalProps) {
  const [state, dispatch] = useReducer(formReducer, undefined, () =>
    initFormState(listing, initialAudioData),
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

  React.useEffect(() => {
    dispatch(initFormState(listing, initialAudioData));
  }, [listing, isOpen, initialAudioData]);

  const { data: scholarsData } = useApiQuery<{ scholars: ScholarListItemDto[] }>(
    [...queryKeys.scholars.list.all()],
    () =>
      httpClient<{ scholars: ScholarListItemDto[] }>({
        url: endpoints.scholars.list,
        method: "GET",
      }),
  );

  const { data: topicsData } = useApiQuery<TopicRefDto[]>(queryKeys.topics.list(), () =>
    httpClient<TopicRefDto[]>({ url: endpoints.topics.list, method: "GET" }),
  );

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

  const handleTitleChange = (val: string) => {
    if (!listing) {
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
      if (listing) {
        await updateLecture(listing.id, {
          title,
          description,
          status,
          orderIndex: Number(orderIndex),
        });
      } else {
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
      title={listing ? "Edit Lecture Details" : "New Lecture Details"}
      size="xl"
      width="var(--modal-listing-width)"
      footer={
        <>
          <Button variant="surface" radius="md" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            radius="md"
            type="submit"
            disabled={saving}
            form="lecture-edit-form"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
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
            <Dropdown value={scholarId} onValueChange={(value) => dispatch({ scholarId: value })}>
              <DropdownTrigger
                id="lecture-scholar"
                placeholder="Select Scholar"
                disabled={!!listing}
                testId="scholar-dropdown"
              />
              <DropdownContent searchable>
                {scholars.map((s) => (
                  <DropdownItem key={s.id} value={s.id}>
                    {s.name}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lecture-series" className={styles.label}>
              Series
            </label>
            <Dropdown value={seriesId} onValueChange={(value) => dispatch({ seriesId: value })}>
              <DropdownTrigger
                id="lecture-series"
                placeholder="Select Series (Optional)"
                disabled={!!listing}
                testId="series-dropdown"
              />
              <DropdownContent searchable>
                {series.map((s) => (
                  <DropdownItem key={s.id} value={s.id}>
                    {s.title}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="lecture-status" className={styles.label}>
              Status
            </label>
            <Dropdown
              value={status}
              onValueChange={(value) => dispatch({ status: validateLectureStatus(value) })}
            >
              <DropdownTrigger
                id="lecture-status"
                placeholder="Select Status"
                testId="status-dropdown"
              />
              <DropdownContent>
                <DropdownItem value="draft">Draft</DropdownItem>
                <DropdownItem value="published">Published</DropdownItem>
                <DropdownItem value="archived">Archived</DropdownItem>
              </DropdownContent>
            </Dropdown>
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
                  disabled={!!listing}
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
