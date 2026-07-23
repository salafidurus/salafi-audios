"use client";

import React, { useReducer, useState, useEffect } from "react";
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
import { Search } from "@/shared/components/Search";
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

type Locale = "en" | "ar";

type FormState = {
  title: string;
  slug: string;
  description: string;
  scholarId: string;
  seriesId: string;
  status: LectureStatus;
  orderIndex: number;
  selectedTopics: string[];
  language: Locale;
  translationChanges: Record<Locale, { title?: string; description?: string }>;
  saving: boolean;
  formError: string | null;
};

export type FormAction =
  | { type: "UPDATE_FIELD"; field: keyof FormState; value: any }
  | { type: "UPDATE_TRANSLATION"; locale: Locale; field: "title" | "description"; value: string }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "INIT_STATE"; state: FormState };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "UPDATE_TRANSLATION":
      return {
        ...state,
        translationChanges: {
          ...state.translationChanges,
          [action.locale]: {
            ...state.translationChanges[action.locale],
            [action.field]: action.value,
          },
        },
      };
    case "SET_SAVING":
      return { ...state, saving: action.saving };
    case "SET_ERROR":
      return { ...state, formError: action.error };
    case "INIT_STATE":
      return action.state;
    default:
      return state;
  }
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
      language: (listing.language as Locale) || "ar",
      translationChanges: { en: {}, ar: {} },
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
    language: "ar",
    translationChanges: { en: {}, ar: {} },
    saving: false,
    formError: null,
  };
}

interface ListingFormProps {
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  scholars: ScholarListItemDto[];
  topics: TopicDetailDto[];
  series: ListingRefDto[];
  listing?: AdminListingDetailDto | null;
  activeLocale: Locale;
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
  activeLocale,
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
    language,
    translationChanges,
    formError,
  } = state;
  const selectedTopicsSet = React.useMemo(() => new Set(selectedTopics), [selectedTopics]);
  const isMainLocale = activeLocale === language;
  const translation = translationChanges[activeLocale];

  return (
    <>
      {formError && <div className={styles.errorBanner}>{formError}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="lecture-title" className={styles.label}>
          {t("admin.contents.listing.titleLabel", "Title")}
        </label>
        <input
          id="lecture-title"
          type="text"
          className={styles.input}
          value={isMainLocale ? title : translation.title || ""}
          onChange={(e) => {
            if (isMainLocale) {
              handleTitleChange(e.target.value);
            } else {
              dispatch({
                type: "UPDATE_TRANSLATION",
                locale: activeLocale,
                field: "title",
                value: e.target.value,
              });
            }
          }}
          required
        />
      </div>

      {isMainLocale && (
        <>
          <div className={styles.formGroup}>
            <label htmlFor="lecture-slug" className={styles.label}>
              {t("admin.contents.listing.slugLabel", "Slug")}
            </label>
            <input
              id="lecture-slug"
              type="text"
              className={styles.input}
              value={slug}
              onChange={(e) =>
                dispatch({ type: "UPDATE_FIELD", field: "slug", value: e.target.value })
              }
              placeholder={t(
                "admin.contents.listing.slugPlaceholder",
                "Auto-generated if left blank",
              )}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lecture-language" className={styles.label}>
              {t("admin.contents.listing.languageLabel", "Language")}
            </label>
            <Dropdown
              value={language}
              onValueChange={(value) =>
                dispatch({ type: "UPDATE_FIELD", field: "language", value: value as Locale })
              }
            >
              <DropdownTrigger id="lecture-language" />
              <DropdownContent>
                <DropdownItem value="ar">العربية</DropdownItem>
                <DropdownItem value="en">English</DropdownItem>
              </DropdownContent>
            </Dropdown>
          </div>
        </>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="lecture-description" className={styles.label}>
          {t("admin.contents.listing.descriptionLabel", "Description")}
        </label>
        <textarea
          id="lecture-description"
          className={styles.textarea}
          value={isMainLocale ? description : translation.description || ""}
          onChange={(e) => {
            if (isMainLocale) {
              dispatch({ type: "UPDATE_FIELD", field: "description", value: e.target.value });
            } else {
              dispatch({
                type: "UPDATE_TRANSLATION",
                locale: activeLocale,
                field: "description",
                value: e.target.value,
              });
            }
          }}
          rows={3}
        />
      </div>

      {isMainLocale && (
        <>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="lecture-scholar" className={styles.label}>
                {t("admin.contents.listing.scholarLabel", "Scholar")}
              </label>
              <Dropdown
                value={scholarId}
                onValueChange={(value) =>
                  dispatch({ type: "UPDATE_FIELD", field: "scholarId", value })
                }
              >
                <DropdownTrigger
                  id="lecture-scholar"
                  placeholder={t("admin.contents.listing.scholarPlaceholder", "Select Scholar")}
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
              <Dropdown
                value={seriesId}
                onValueChange={(value) =>
                  dispatch({ type: "UPDATE_FIELD", field: "seriesId", value })
                }
              >
                <DropdownTrigger
                  id="lecture-series"
                  placeholder={t(
                    "admin.contents.listing.seriesPlaceholder",
                    "Select Series (Optional)",
                  )}
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
                onValueChange={(value) =>
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "status",
                    value: validateLectureStatus(value),
                  })
                }
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
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "orderIndex",
                    value: Number.isNaN(parsed) ? 0 : (parsed ?? 0),
                  });
                }}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <span className={styles.label}>
              {t("admin.contents.listing.topicsLabel", "Topics")}
            </span>
            {topics.length > 0 ? (
              <Search.Filter
                chips={topics.map((t) => ({ id: t.id, label: t.name.en }))}
                selected={selectedTopics}
                onChipChange={handleTopicToggle}
                multiple
                includeAllOption={false}
              />
            ) : (
              <span className={styles.noData}>
                {t("admin.contents.listing.noTopicsAvailable", "No topics available")}
              </span>
            )}
          </div>
        </>
      )}
    </>
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
  const [activeTab, setActiveTab] = useState<"general" | "en" | "ar" | "upload" | "arrange" | "review">(
    showAudioUploadTab && !listing && !initialAudioData ? "upload" : "general",
  );
  const [state, dispatch] = useReducer(formReducer, listing ?? null, initFormState);
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
    language,
    translationChanges,
  } = state;

  useEffect(() => {
    if (!isOpen) return;
    const initialState = initFormState(listing, initialAudioData);
    dispatch({ type: "INIT_STATE", state: initialState });
    setActiveTab(!listing && !initialAudioData ? "upload" : "general");
  }, [isOpen, listing, initialAudioData]);

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
      dispatch({ type: "UPDATE_FIELD", field: "title", value: val });
      dispatch({
        type: "UPDATE_FIELD",
        field: "slug",
        value: val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-"),
      });
    } else {
      dispatch({ type: "UPDATE_FIELD", field: "title", value: val });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      dispatch({
        type: "SET_ERROR",
        error: t("admin.contents.listing.titleRequired", "Title is required."),
      });
      return;
    }
    if (!scholarId) {
      dispatch({
        type: "SET_ERROR",
        error: t("admin.contents.listing.scholarRequired", "Scholar is required."),
      });
      return;
    }

    dispatch({ type: "SET_SAVING", saving: true });
    dispatch({ type: "SET_ERROR", error: null });

    try {
      if (listing) {
        const payload: any = {
          title,
          description,
          status,
          orderIndex: Number(orderIndex),
          language,
        };

        const otherLocale = language === "en" ? "ar" : "en";
        const translation = translationChanges[otherLocale];
        if (translation.title || translation.description) {
          payload.translations = {
            [otherLocale]: {
              ...(translation.title && { title: translation.title }),
              ...(translation.description !== undefined && {
                description: translation.description,
              }),
            },
          };
        }

        await updateLecture(listing.id, payload);
      } else {
        if (!initialAudioData) {
          dispatch({
            type: "SET_ERROR",
            error: t(
              "admin.contents.listing.audioKeyRequired",
              "Audio file key is required for creation.",
            ),
          });
          dispatch({ type: "SET_SAVING", saving: false });
          return;
        }
        const payload: any = {
          title,
          slug: slug || undefined,
          scholarId,
          parentId: seriesId || undefined,
          topics: selectedTopics,
          format: "single",
          audioKey: initialAudioData.audioKey,
          durationSeconds: initialAudioData.durationSeconds,
          sizeBytes: initialAudioData.sizeBytes,
          language,
        };

        const otherLocale = language === "en" ? "ar" : "en";
        const translation = translationChanges[otherLocale];
        if (translation.title || translation.description) {
          payload.translations = {
            [otherLocale]: {
              ...(translation.title && { title: translation.title }),
              ...(translation.description !== undefined && {
                description: translation.description,
              }),
            },
          };
        }

        await createLecture(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        error:
          (err as Error)?.message ||
          t("admin.contents.listing.failedToSave", "Failed to save lecture details."),
      });
    } finally {
      dispatch({ type: "SET_SAVING", saving: false });
    }
  };

  const handleTopicToggle = (topicId: string) => {
    dispatch({
      type: "UPDATE_FIELD",
      field: "selectedTopics",
      value: selectedTopics.includes(topicId)
        ? selectedTopics.filter((id) => id !== topicId)
        : [...selectedTopics, topicId],
    });
  };

  const scholars = scholarsData?.scholars ?? [];
  const topics = topicsData ?? [];
  const series = seriesData ?? [];

  useEffect(() => {
    if (!listing || !scholarId || !scholarsData?.scholars) return;
    const selectedScholar = scholarsData.scholars.find((s) => s.id === scholarId);
    if (selectedScholar && selectedScholar.mainLanguage) {
      dispatch({
        type: "UPDATE_FIELD",
        field: "language",
        value: selectedScholar.mainLanguage as Locale,
      });
    }
  }, [scholarId, scholarsData, listing]);

  return (
    <Modal
      key={listing?.id ?? "create"}
      isOpen={isOpen}
      onClose={onClose}
      title={
        listing
          ? t("admin.contents.listing.editTitle", "Edit Listing Details")
          : t("admin.contents.listing.newTitle", "Add Listing")
      }
      size="xl"
      width="var(--modal-width-wide)"
      multiTab
      requireReview={!showAudioUploadTab || !!initialAudioData}
      activeTab={activeTab}
      onActiveTabChange={(id) => setActiveTab(id as typeof activeTab)}
      defaultActiveTab="general"
      saveFormId="lecture-edit-form"
      saving={saving}
      reviewTabId="review"
    >
      <form id="lecture-edit-form" onSubmit={handleSave} className={styles.form}>
        <Modal.Tabs>
          <Modal.TabItem id="general">{t("admin.modal.generalTab", "General")}</Modal.TabItem>
          <Modal.TabItem id="en">English</Modal.TabItem>
          <Modal.TabItem id="ar">العربية</Modal.TabItem>
          <Modal.TabItem id="upload">
            {t("admin.contents.listing.uploadTab", "Upload Audio")}
          </Modal.TabItem>
          <Modal.TabItem id="arrange">
            {t("admin.contents.listing.arrangeTab", "Arrange")}
          </Modal.TabItem>
          <Modal.TabItem id="review">{t("admin.modal.reviewTab", "Review")}</Modal.TabItem>
        </Modal.Tabs>

        <Modal.Content>
          <Modal.ContentItem id="general">
            <ListingForm
              state={state}
              dispatch={dispatch}
              scholars={scholars}
              topics={topics}
              series={series}
              listing={listing}
              activeLocale={language}
              handleTitleChange={handleTitleChange}
              handleTopicToggle={handleTopicToggle}
              onSubmit={handleSave}
            />
          </Modal.ContentItem>

          <Modal.ContentItem id="en">
            <ListingForm
              state={state}
              dispatch={dispatch}
              scholars={scholars}
              topics={topics}
              series={series}
              listing={listing}
              activeLocale="en"
              handleTitleChange={handleTitleChange}
              handleTopicToggle={handleTopicToggle}
              onSubmit={handleSave}
            />
          </Modal.ContentItem>

          <Modal.ContentItem id="ar">
            <ListingForm
              state={state}
              dispatch={dispatch}
              scholars={scholars}
              topics={topics}
              series={series}
              listing={listing}
              activeLocale="ar"
              handleTitleChange={handleTitleChange}
              handleTopicToggle={handleTopicToggle}
              onSubmit={handleSave}
            />
          </Modal.ContentItem>

          <Modal.ContentItem id="upload">
            <AudioUploader onUploadComplete={onAudioUploadComplete || (() => {})} />
          </Modal.ContentItem>

          <Modal.ContentItem id="arrange">
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--content-tertiary)" }}>
              {t("admin.contents.listing.arrangeComingSoon", "Coming soon")}
            </div>
          </Modal.ContentItem>

          <Modal.ContentItem id="review">
            <div style={{ padding: "2rem" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ marginBottom: "0.5rem", color: "var(--content-default)" }}>Scholar</h4>
                <p>{scholars.find((s) => s.id === scholarId)?.name || "—"}</p>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ marginBottom: "0.5rem", color: "var(--content-default)" }}>English</h4>
                <p>
                  <strong>Title:</strong> {language === "en" ? title : translationChanges.en.title || "—"}
                </p>
                <p>
                  <strong>Description:</strong> {language === "en" ? description : translationChanges.en.description || "—"}
                </p>
              </div>
              <div>
                <h4 style={{ marginBottom: "0.5rem", color: "var(--content-default)" }}>العربية</h4>
                <p>
                  <strong>Title:</strong> {language === "ar" ? title : translationChanges.ar.title || "—"}
                </p>
                <p>
                  <strong>Description:</strong> {language === "ar" ? description : translationChanges.ar.description || "—"}
                </p>
              </div>
            </div>
          </Modal.ContentItem>
        </Modal.Content>
      </form>
    </Modal>
  );
}
