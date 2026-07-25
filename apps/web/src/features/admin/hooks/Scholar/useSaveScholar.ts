import type { CreateScholarDto, Locale, UpdateScholarDto } from "@sd/core-contracts";
import { sanitizeError } from "@sd/utils-error";
import { useTranslation } from "@/core/i18n/use-translation";
import { getSecondaryLocales, buildTranslationsPayload } from "@/features/admin/utils/locale-tabs";
import { getPresignedUrl, uploadToR2 } from "@/features/admin/api/admin-lectures.api";
import { createScholar, updateScholar } from "@/features/admin/api/admin.api";
import type { FormAction, FormState } from "./useScholarForm";

async function uploadStagedImage(state: FormState) {
  if (!state.stagedImageFile) return state.imageUrl || undefined;

  const ext = state.stagedImageFile.name.split(".").pop()?.toLowerCase() || "png";
  const filename = `${state.slug}.${ext}`;
  const presignedResponse = await getPresignedUrl({
    filename,
    contentType: state.stagedImageFile.type,
    purpose: "image",
    slug: state.slug,
  });
  await uploadToR2(presignedResponse.uploadUrl, state.stagedImageFile, state.stagedImageFile.type);
  return presignedResponse.publicUrl;
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
    const errTabs: string[] = [];

    if (!state.mainLanguage) {
      errTabs.push("general");
    }
    if (!state.isEditing && !state.name?.trim()) {
      errTabs.push("main");
    }
    if (!state.isEditing && !state.slug?.trim()) {
      errTabs.push("general");
    }

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
      const mainLocale = (state.mainLanguage || "ar") as Locale;
      const secondaryLocales = getSecondaryLocales(mainLocale);
      const translations = buildTranslationsPayload(
        state.translationChanges,
        secondaryLocales,
        (v) => !!v?.name,
      )?.map((tr) => ({ ...tr, name: tr.name ?? "" }));

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
          imageUrl: await uploadStagedImage(state),
          translations,
        };

        await updateScholar(state.id, payload);
      } else {
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
          imageUrl: await uploadStagedImage(state),
          translations,
        };

        await createScholar(payload);
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
