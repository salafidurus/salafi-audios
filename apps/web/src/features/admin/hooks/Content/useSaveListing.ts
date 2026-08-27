import type { UpdateListingDetailsDto } from "@sd/core-contracts";

import { sanitizeError } from "@sd/utils-error";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  createLecture,
  updateListingDetails,
  getPresignedUrl,
  uploadToR2,
} from "@/features/admin/api/admin-lectures.api";

import type { FormAction, FormState } from "./useListingForm";

async function uploadStagedCoverImage(
  state: FormState,
): Promise<{ url: string | undefined; key: string | undefined }> {
  if (!state.stagedImageFile) return { url: state.coverImageUrl || undefined, key: undefined };

  const ext = state.stagedImageFile.name.split(".").pop()?.toLowerCase() || "png";
  const filename = `${state.slug}.${ext}`;
  const presignedResponse = await getPresignedUrl({
    filename,
    contentType: state.stagedImageFile.type,
    purpose: "image",
    entityType: "listing",
    slug: state.slug,
  });
  await uploadToR2(presignedResponse.uploadUrl, state.stagedImageFile, state.stagedImageFile.type);
  return { url: presignedResponse.publicUrl, key: presignedResponse.objectKey };
}

function getRequiredFieldErrorTabs(state: FormState): string[] {
  const tabs: string[] = [];
  const hasGeneralFields = [state.scholarId, state.language, state.selectedTopics?.length].every(
    Boolean,
  );
  const hasMainFields = [state.title, state.slug].every((value) => Boolean(value?.trim()));

  if (!hasGeneralFields) tabs.push("general");
  if (!hasMainFields) tabs.push("main");
  if (!state.isEditing && state.scholarId && !state.slugSuffix?.trim()) tabs.push("general");
  return tabs;
}

async function updateExistingListing(state: FormState): Promise<void> {
  if (!state.id) throw new Error("Listing ID required for update");

  const coverImage = await uploadStagedCoverImage(state);
  const payload: UpdateListingDetailsDto = {
    title: state.title,
    description: state.description,
    language: state.language,
    status: state.status,
    orderIndex: state.orderIndex,
    parentId: undefined,
    topics: state.selectedTopics,
    coverImageUrl: coverImage.url,
    coverImageKey: coverImage.key,
  };

  await updateListingDetails(state.id, payload);
}

async function createNewListing(state: FormState): Promise<void> {
  const coverImage = await uploadStagedCoverImage(state);
  await createLecture({
    title: state.title,
    slug: state.slug,
    scholarId: state.scholarId,
    format: state.format,
    language: state.language,
    status: state.status,
    topics: state.selectedTopics,
    coverImageUrl: coverImage.url,
    coverImageKey: coverImage.key,
  });
}

async function saveListing(state: FormState): Promise<void> {
  if (state.isEditing) {
    await updateExistingListing(state);
    return;
  }
  await createNewListing(state);
}

export function useSaveListing(
  state: FormState,
  dispatch: (action: FormAction) => void,
  onSuccess: () => void | Promise<void>,
  onClose: () => void,
  setErrorTabs: (tabs: string[]) => void,
) {
  const { t } = useTranslation();

  return async (e: React.FormEvent) => {
    e.preventDefault();
    const errTabs = getRequiredFieldErrorTabs(state);

    if (errTabs.length > 0) {
      setErrorTabs(errTabs);
      dispatch({
        type: "SET_ERROR",
        error: t(
          "admin.contents.listing.requiredFieldsMissing",
          "Language, scholar, at least one topic, title, and slug are required.",
        ),
      });
      return;
    }

    setErrorTabs([]);
    dispatch({ type: "SET_SAVING", saving: true });
    dispatch({ type: "SET_ERROR", error: null });

    try {
      await saveListing(state);

      await onSuccess();
      onClose();
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: sanitizeError(err) });
    } finally {
      dispatch({ type: "SET_SAVING", saving: false });
    }
  };
}
