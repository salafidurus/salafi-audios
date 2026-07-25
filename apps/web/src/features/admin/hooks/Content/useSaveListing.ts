import type { Locale, UpdateListingDetailsDto } from "@sd/core-contracts";
import { sanitizeError } from "@sd/utils-error";
import { useTranslation } from "@/core/i18n/use-translation";
import { getSecondaryLocales, buildTranslationsPayload } from "@/features/admin/utils/locale-tabs";
import {
  createLecture,
  updateListingDetails,
  getPresignedUrl,
  uploadToR2,
} from "@/features/admin/api/admin-lectures.api";
import type { FormAction, FormState } from "./useListingForm";

interface InitialAudioData {
  audioKey: string;
  durationSeconds: number;
  sizeBytes: number;
  format: string;
  filename: string;
}

async function uploadStagedCoverImage(state: FormState) {
  if (!state.stagedImageFile) return state.coverImageUrl || undefined;

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
  return presignedResponse.publicUrl;
}

export function useSaveListing(
  state: FormState,
  dispatch: (action: FormAction) => void,
  initialAudioData: InitialAudioData | null | undefined,
  onSuccess: () => void | Promise<void>,
  onClose: () => void,
  setErrorTabs: (tabs: string[]) => void,
) {
  const { t } = useTranslation();

  return async (e: React.FormEvent) => {
    e.preventDefault();
    const errTabs: string[] = [];

    if (
      !state.scholarId ||
      !state.language ||
      !state.selectedTopics ||
      state.selectedTopics.length === 0
    ) {
      errTabs.push("general");
    }
    if (!(state.title ?? "").trim() || !state.slug?.trim()) {
      errTabs.push("main");
    }

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
      const mainLocale = (state.language || "ar") as Locale;
      const secondaryLocales = getSecondaryLocales(mainLocale);
      const translations = buildTranslationsPayload(
        state.translationChanges,
        secondaryLocales,
        (v) => !!(v?.title || v?.description),
      )?.map((tr) => ({ ...tr, title: tr.title ?? "" }));

      if (state.isEditing) {
        if (!state.id) throw new Error("Listing ID required for update");

        const payload: UpdateListingDetailsDto = {
          title: state.title,
          description: state.description,
          language: state.language,
          status: state.status,
          orderIndex: state.orderIndex,
          parentId: undefined,
          topics: state.selectedTopics,
          coverImageUrl: await uploadStagedCoverImage(state),
          translations,
        };

        await updateListingDetails(state.id, payload);
      } else {
        if (!initialAudioData) {
          throw new Error(
            t(
              "admin.contents.listing.audioKeyRequired",
              "Audio file key is required for creation.",
            ),
          );
        }

        await createLecture({
          title: state.title,
          slug: state.slug,
          scholarId: state.scholarId,
          format: state.format,
          language: state.language,
          topics: state.selectedTopics,
          audioKey: initialAudioData.audioKey,
          durationSeconds: initialAudioData.durationSeconds,
          sizeBytes: initialAudioData.sizeBytes,
          coverImageUrl: await uploadStagedCoverImage(state),
          translations,
        });
      }

      await onSuccess();
      onClose();
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: sanitizeError(err) });
    } finally {
      dispatch({ type: "SET_SAVING", saving: false });
    }
  };
}
