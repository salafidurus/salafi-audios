"use client";

import React, { useReducer } from "react";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import { AudioUploader } from "../AudioUploader/AudioUploader";
import type {
  ScholarListItemDto,
  TopicDetailDto,
  ListingRefDto,
  AdminListingDetailDto,
} from "@sd/core-contracts";
import { useTopicsList } from "@sd/domain-search";
import { useAdminListingSeriesByScholar } from "@sd/domain-content";
import { validateLectureStatus, type LectureStatus } from "@/shared/types/form-types";
import { createLecture, updateLecture } from "../../api/admin-lectures.api";
import { Modal } from "@/shared/components/Modal";
import { useTranslation } from "@/core/i18n/use-translation";
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
  showAudioUploadTab?: boolean;
  onAudioUploadComplete?: (audioData: any) => void;
}

type FormState = {
  title: string;
  slug: string;
  description: string;
  scholarId: string;
  seriesId: string;
  status: LectureStatus;
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
      status: validateLectureStatus(listing.status),
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

interface ListingFormProps {
  state: FormState;
  dispatch: React.Dispatch<Partial<FormState>>;
  scholars: ScholarListItemDto[];
  topics: TopicDetailDto[];
  series: ListingRefDto[];
  listing?: AdminListingDetailDto | null;
  handleTitleChange: (val: string) => void;
  handleTopicToggle: (topicId: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function ListingForm({
  state,
  dispatch,
  scholars,
  topics,
  series,
  listing,
  handleTitleChange,
  handleTopicToggle,
  onSubmit,
}: ListingFormProps) {
  const { t } = useTranslation();
  const {
    title,
    slug,
    description,
    scholarId,
    seriesId,
    status,
    orderIndex,
    selectedTopics,
    formError,
  } = state;
  const selectedTopicsSet = React.useMemo(() => new Set(selectedTopics), [selectedTopics]);

  return (
    <form id="lecture-edit-form" onSubmit={onSubmit} className={styles.form}>
      {formError && <div className={styles.errorBanner}>{formError}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="lecture-title" className={styles.label}>
          {t("admin.contents.listing.titleLabel", "Title")}
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
          {t("admin.contents.listing.slugLabel", "Slug")}
        </label>
        <input
          id="lecture-slug"
          type="text"
          className={styles.input}
          value={slug}
          onChange={(e) => dispatch({ slug: e.target.value })}
          placeholder={t("admin.contents.listing.slugPlaceholder", "Auto-generated if left blank")}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="lecture-description" className={styles.label}>
          {t("admin.contents.listing.descriptionLabel", "Description")}
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
            {t("admin.contents.listing.scholarLabel", "Scholar")}
          </label>
          <Dropdown value={scholarId} onValueChange={(value) => dispatch({ scholarId: value })}>
            <DropdownTrigger
              id="lecture-scholar"
              placeholder={t("admin.contents.listing.scholarPlaceholder", "Select Scholar")}
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
            {t("admin.contents.listing.seriesLabel", "Series")}
          </label>
          <Dropdown value={seriesId} onValueChange={(value) => dispatch({ seriesId: value })}>
            <DropdownTrigger
              id="lecture-series"
              placeholder={t(
                "admin.contents.listing.seriesPlaceholder",
                "Select Series (Optional)",
              )}
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
            {t("admin.contents.listing.statusLabel", "Status")}
          </label>
          <Dropdown
            value={status}
            onValueChange={(value) => dispatch({ status: validateLectureStatus(value) })}
          >
            <DropdownTrigger
              id="lecture-status"
              placeholder={t("admin.contents.listing.statusPlaceholder", "Select Status")}
              testId="status-dropdown"
            />
            <DropdownContent>
              <DropdownItem value="draft">
                {t("admin.contents.listing.draft", "Draft")}
              </DropdownItem>
              <DropdownItem value="review">
                {t("admin.contents.listing.review", "In Review")}
              </DropdownItem>
              <DropdownItem value="published">
                {t("admin.contents.listing.published", "Published")}
              </DropdownItem>
              <DropdownItem value="archived">
                {t("admin.contents.listing.archived", "Archived")}
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="lecture-order" className={styles.label}>
            {t("admin.contents.listing.orderIndexLabel", "Order Index")}
          </label>
          <input
            id="lecture-order"
            type="number"
            className={styles.input}
            value={orderIndex}
            onChange={(e) => {
              const value = e.target.value;
              const parsed = value ? Number(value) : undefined;
              dispatch({ orderIndex: Number.isNaN(parsed) ? 0 : (parsed ?? 0) });
            }}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <span className={styles.label}>{t("admin.contents.listing.topicsLabel", "Topics")}</span>
        <div className={styles.topicsGrid}>
          {topics.map((tItem) => (
            <label key={tItem.id} className={styles.topicCheckboxLabel}>
              <input
                type="checkbox"
                checked={selectedTopicsSet.has(tItem.id)}
                onChange={() => handleTopicToggle(tItem.id)}
                className={styles.checkbox}
                disabled={!!listing}
              />
              <span>{tItem.name.en}</span>
            </label>
          ))}
          {topics.length === 0 && (
            <span className={styles.noData}>
              {t("admin.contents.listing.noTopicsAvailable", "No topics available")}
            </span>
          )}
        </div>
      </div>
    </form>
  );
}

export function ListingModal({
  isOpen,
  onClose,
  onSuccess,
  listing,
  initialAudioData,
  showAudioUploadTab,
  onAudioUploadComplete,
}: ListingModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<"audio" | "details">(
    showAudioUploadTab && !initialAudioData ? "audio" : "details",
  );
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

  const { data: topicsData } = useTopicsList();

  const { data: seriesData } = useAdminListingSeriesByScholar(scholarId);

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
      dispatch({ formError: t("admin.contents.listing.titleRequired", "Title is required.") });
      return;
    }
    if (!scholarId) {
      dispatch({ formError: t("admin.contents.listing.scholarRequired", "Scholar is required.") });
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
          dispatch({
            formError: t(
              "admin.contents.listing.audioKeyRequired",
              "Audio file key is required for creation.",
            ),
            saving: false,
          });
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
      dispatch({
        formError:
          (err as Error)?.message ||
          t("admin.contents.listing.failedToSave", "Failed to save lecture details."),
      });
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        listing
          ? t("admin.contents.listing.editTitle", "Edit Listing Details")
          : t("admin.contents.listing.newTitle", "Add Listing")
      }
      size="xl"
      width="var(--modal-width-standard)"
      footer={
        <>
          <Button variant="surface" radius="md" onClick={onClose} disabled={saving}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            variant="primary"
            radius="md"
            type="submit"
            disabled={saving}
            form="lecture-edit-form"
          >
            {saving ? t("admin.permissions.saving", "Saving…") : t("common.save", "Save")}
          </Button>
        </>
      }
    >
      {showAudioUploadTab && !listing && (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1.5rem",
            borderBottom: "1px solid var(--border-default)",
            paddingBottom: "1rem",
          }}
        >
          <Button
            variant={activeTab === "audio" ? "primary" : "ghost"}
            onClick={() => setActiveTab("audio")}
          >
            {t("admin.contents.listing.uploadTab", "Upload Audio")}
          </Button>
          <Button
            variant={activeTab === "details" ? "primary" : "ghost"}
            onClick={() => setActiveTab("details")}
          >
            {t("admin.contents.listing.detailsTab", "Listing Details")}
          </Button>
        </div>
      )}

      {activeTab === "audio" ? (
        <AudioUploader onUploadComplete={onAudioUploadComplete || (() => {})} />
      ) : (
        <ListingForm
          state={state}
          dispatch={dispatch}
          scholars={scholars}
          topics={topics}
          series={series}
          listing={listing}
          handleTitleChange={handleTitleChange}
          handleTopicToggle={handleTopicToggle}
          onSubmit={handleSave}
        />
      )}
    </Modal>
  );
}
