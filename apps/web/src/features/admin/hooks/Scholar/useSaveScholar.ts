import type { CreateScholarDto, UpdateScholarDto } from "@sd/core-contracts";

import { sanitizeError } from "@sd/utils-error";

import { useTranslation } from "@/core/i18n/use-translation";
import { getPresignedUrl, uploadToR2 } from "@/features/admin/api/admin-lectures.api";
import { createScholar, updateScholar } from "@/features/admin/api/admin.api";

import type { FormAction, FormState } from "./useScholarForm";

async function uploadStagedImage(
  state: FormState,
): Promise<{ url: string | undefined; key: string | undefined }> {
  if (!state.stagedImageFile) return { url: state.imageUrl || undefined, key: undefined };

  const ext = state.stagedImageFile.name.split(".").pop()?.toLowerCase() || "png";
  const filename = `${state.slug}.${ext}`;
  const presignedResponse = await getPresignedUrl({
    filename,
    contentType: state.stagedImageFile.type,
    purpose: "image",
    slug: state.slug,
  });
  await uploadToR2(presignedResponse.uploadUrl, state.stagedImageFile, state.stagedImageFile.type);
  return { url: presignedResponse.publicUrl, key: presignedResponse.objectKey };
}

function getScholarSaveErrorTabs(state: FormState): string[] {
  const tabs: string[] = [];
  if (!state.mainLanguage) tabs.push("general");
  if (!state.isEditing && !state.name?.trim()) tabs.push("main");
  if (!state.isEditing && !state.slug?.trim()) tabs.push("general");
  return tabs;
}

async function persistScholar(state: FormState): Promise<void> {
  const image = await uploadStagedImage(state);
  if (state.isEditing) {
    if (!state.id) throw new Error("Scholar ID required for update");
    const payload: UpdateScholarDto = {
      name: state.name,
      bio: state.bio,
      isActive: state.isActive,
      country: state.country,
      mainLanguage: state.mainLanguage,
      title: state.title,
      orderIndex: state.orderIndex,
      socialTwitter: state.socialTwitter,
      socialTelegram: state.socialTelegram,
      socialYoutube: state.socialYoutube,
      socialWebsite: state.socialWebsite,
      imageUrl: image.url,
      imageKey: image.key,
    };
    await updateScholar(state.id, payload);
    return;
  }

  const payload: CreateScholarDto = {
    name: state.name,
    slug: state.slug,
    bio: state.bio,
    isActive: state.isActive,
    country: state.country ?? "SA",
    mainLanguage: state.mainLanguage,
    title: state.title,
    orderIndex: state.orderIndex,
    socialTwitter: state.socialTwitter,
    socialTelegram: state.socialTelegram,
    socialYoutube: state.socialYoutube,
    socialWebsite: state.socialWebsite,
    imageUrl: image.url,
    imageKey: image.key,
  };
  await createScholar(payload);
}

export function useSaveScholar(
  state: FormState,
  dispatch: (action: FormAction) => void,
  onSuccess: () => void | Promise<void>,
  onClose: () => void,
  setErrorTabs: (tabs: string[]) => void,
) {
  const { t } = useTranslation();

  return async (e: React.FormEvent) => {
    e.preventDefault();
    const errTabs = getScholarSaveErrorTabs(state);

    if (errTabs.length > 0) {
      setErrorTabs(errTabs);
      dispatch({
        type: "SET_ERROR",
        error: t("admin.scholars.nameSlugRequired", "Name, slug, and main language are required"),
      });
      return;
    }

    setErrorTabs([]);
    dispatch({ type: "SET_SAVING", saving: true });
    dispatch({ type: "SET_ERROR", error: null });

    try {
      await persistScholar(state);

      await onSuccess();
      onClose();
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: sanitizeError(err) });
    } finally {
      dispatch({ type: "SET_SAVING", saving: false });
    }
  };
}
