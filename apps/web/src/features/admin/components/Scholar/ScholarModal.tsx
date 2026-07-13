"use client";

import { useReducer, useEffect } from "react";
import Image from "next/image";
import { AlertCircle, Loader } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { EditableInput } from "@/shared/components/EditableInput";
import { EditableTextarea } from "@/shared/components/EditableTextarea";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/Dropdown";
import { FormSection } from "@/features/admin/components/FormSection";
import type { CreateScholarDto } from "@sd/core-contracts";
import { COUNTRY_LIST } from "@sd/core-contracts";
import { sanitizeError } from "@sd/utils-error";
import styles from "./scholar-modal.module.css";

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

export interface ScholarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateScholarDto) => Promise<void>;
  scholar?: ScholarForEdit | null;
}

interface FormState {
  formData: CreateScholarDto;
  saving: boolean;
  error: string | null;
  imageLoading: boolean;
  imageError: boolean;
}

type FormAction =
  | { type: "INIT_FORM"; scholar: ScholarForEdit | null }
  | { type: "UPDATE_FIELD"; field: keyof CreateScholarDto; value: string | boolean }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_IMAGE_LOADING"; loading: boolean }
  | { type: "SET_IMAGE_ERROR"; error: boolean };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "INIT_FORM":
      return {
        ...state,
        formData: getInitialFormData(action.scholar),
        error: null,
        imageLoading: false,
        imageError: false,
      };
    case "UPDATE_FIELD":
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value },
      };
    case "SET_SAVING":
      return { ...state, saving: action.saving };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SET_IMAGE_LOADING":
      return { ...state, imageLoading: action.loading };
    case "SET_IMAGE_ERROR":
      return { ...state, imageError: action.error };
    default:
      return state;
  }
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
      country: (scholar.country ?? "") as CreateScholarDto["country"],
      mainLanguage: (scholar.mainLanguage ?? "ar") as "en" | "ar",
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
    country: "" as CreateScholarDto["country"],
    mainLanguage: "ar",
    socialTwitter: "",
    socialTelegram: "",
    socialYoutube: "",
    socialWebsite: "",
  };
}

const initialFormState: FormState = {
  formData: getInitialFormData(null),
  saving: false,
  error: null,
  imageLoading: false,
  imageError: false,
};

export function ScholarModal({ isOpen, onClose, onSave, scholar }: ScholarModalProps) {
  const isEditing = !!scholar;

  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const { formData, saving, error, imageLoading, imageError } = state;

  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "INIT_FORM", scholar: scholar ?? null });
    }
  }, [isOpen, scholar]);

  const handleNameChange = (value: string) => {
    dispatch({ type: "UPDATE_FIELD", field: "name", value });
    if (!isEditing) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      dispatch({ type: "UPDATE_FIELD", field: "slug", value: generatedSlug });
    }
  };

  const handleImageUrlChange = (value: string) => {
    dispatch({ type: "UPDATE_FIELD", field: "imageUrl", value });
    dispatch({ type: "SET_IMAGE_ERROR", error: false });
    dispatch({ type: "SET_IMAGE_LOADING", loading: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      dispatch({ type: "SET_ERROR", error: "Name and slug are required" });
      return;
    }
    dispatch({ type: "SET_SAVING", saving: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: sanitizeError(err) });
    } finally {
      dispatch({ type: "SET_SAVING", saving: false });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Scholar" : "Add Scholar"}
      size="xl"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving} form="scholar-form">
            {isEditing ? "Save Changes" : "Add Scholar"}
          </Button>
        </>
      }
    >
      <form id="scholar-form" onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <FormSection title="Basic Information">
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="scholar-name">
                Name *
              </label>
              <EditableInput
                id="scholar-name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Scholar name"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="scholar-slug">
                Slug *
              </label>
              <EditableInput
                id="scholar-slug"
                value={formData.slug}
                onChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "slug", value })}
                placeholder="scholar-slug"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="scholar-bio">
              Bio
            </label>
            <EditableTextarea
              id="scholar-bio"
              value={formData.bio ?? ""}
              onChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "bio", value })}
              placeholder="Brief biography..."
              rows={4}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="scholar-image-url">
              Image URL
            </label>
            <EditableInput
              id="scholar-image-url"
              type="url"
              value={formData.imageUrl ?? ""}
              onChange={handleImageUrlChange}
              placeholder="https://..."
            />
            {formData.imageUrl && (
              <div className={styles.imagePreview}>
                {imageLoading && (
                  <div className={styles.imageLoadingState}>
                    <Loader size={24} className={styles.loadingSpinner} />
                    <span>Loading image...</span>
                  </div>
                )}
                {imageError && (
                  <div className={styles.imageErrorState}>
                    <AlertCircle size={24} />
                    <span>Failed to load image</span>
                  </div>
                )}
                {!imageError && (
                  <Image
                    src={formData.imageUrl}
                    alt="Preview"
                    width={200}
                    height={200}
                    style={{ objectFit: "contain" }}
                    className={styles.previewImage}
                    onLoadingComplete={() =>
                      dispatch({ type: "SET_IMAGE_LOADING", loading: false })
                    }
                    onError={() => {
                      dispatch({ type: "SET_IMAGE_ERROR", error: true });
                      dispatch({ type: "SET_IMAGE_LOADING", loading: false });
                    }}
                    onLoad={() => dispatch({ type: "SET_IMAGE_LOADING", loading: true })}
                  />
                )}
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Location & Language">
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="scholar-country">
                Country
              </label>
              <Dropdown
                value={formData.country ?? ""}
                onValueChange={(value) =>
                  dispatch({ type: "UPDATE_FIELD", field: "country", value })
                }
              >
                <DropdownTrigger id="scholar-country" placeholder="Select Country" />
                <DropdownContent searchable>
                  {COUNTRY_LIST.map((c) => (
                    <DropdownItem key={c.code} value={c.code}>
                      {c.name}
                    </DropdownItem>
                  ))}
                </DropdownContent>
              </Dropdown>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="scholar-language">
                Main Language
              </label>
              <Dropdown
                value={formData.mainLanguage}
                onValueChange={(value) =>
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "mainLanguage",
                    value: value as "en" | "ar",
                  })
                }
              >
                <DropdownTrigger id="scholar-language" placeholder="Select Language" />
                <DropdownContent>
                  <DropdownItem value="en">English</DropdownItem>
                  <DropdownItem value="ar">Arabic (عربي)</DropdownItem>
                </DropdownContent>
              </Dropdown>
            </div>
          </div>
        </FormSection>

        <FormSection title="Social Media">
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="scholar-twitter">
                Twitter
              </label>
              <EditableInput
                id="scholar-twitter"
                type="url"
                value={formData.socialTwitter ?? ""}
                onChange={(value) =>
                  dispatch({ type: "UPDATE_FIELD", field: "socialTwitter", value })
                }
                placeholder="https://twitter.com/..."
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="scholar-telegram">
                Telegram
              </label>
              <EditableInput
                id="scholar-telegram"
                type="url"
                value={formData.socialTelegram ?? ""}
                onChange={(value) =>
                  dispatch({ type: "UPDATE_FIELD", field: "socialTelegram", value })
                }
                placeholder="https://t.me/..."
              />
            </div>
          </div>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="scholar-youtube">
                YouTube
              </label>
              <EditableInput
                id="scholar-youtube"
                type="url"
                value={formData.socialYoutube ?? ""}
                onChange={(value) =>
                  dispatch({ type: "UPDATE_FIELD", field: "socialYoutube", value })
                }
                placeholder="https://youtube.com/..."
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="scholar-website">
                Website
              </label>
              <EditableInput
                id="scholar-website"
                type="url"
                value={formData.socialWebsite ?? ""}
                onChange={(value) =>
                  dispatch({ type: "UPDATE_FIELD", field: "socialWebsite", value })
                }
                placeholder="https://..."
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Settings">
          <div className={styles.checkboxGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.isKibar ?? false}
                onChange={(e) =>
                  dispatch({ type: "UPDATE_FIELD", field: "isKibar", value: e.target.checked })
                }
              />
              <span>Kibar Scholar</span>
            </label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.isFeatured ?? false}
                onChange={(e) =>
                  dispatch({ type: "UPDATE_FIELD", field: "isFeatured", value: e.target.checked })
                }
              />
              <span>Featured</span>
            </label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.isActive ?? true}
                onChange={(e) =>
                  dispatch({ type: "UPDATE_FIELD", field: "isActive", value: e.target.checked })
                }
              />
              <span>Active</span>
            </label>
          </div>
        </FormSection>
      </form>
    </Modal>
  );
}
