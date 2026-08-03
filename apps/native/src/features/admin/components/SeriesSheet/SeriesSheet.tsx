import type { AdminListingDetailDto } from "@sd/core-contracts";

import { subject } from "@casl/ability";
import { BottomSheet, Column, Row, ScrollView } from "@expo/ui";
import { useAbility } from "@sd/domain-account";
import { useReducer } from "react";
import { useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { NativeButton, NativeFormField, NativeText } from "@/shared/ui";

import { createSeries, updateSeries } from "../../api/admin-scholars.api";

type SeriesSheetProps = {
  isOpen: boolean;
  scholarId: string;
  scholarSlug: string;
  series?: AdminListingDetailDto;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  title: string;
  description: string;
  language: string;
  isSaving: boolean;
  error: string | null;
};

function reduce(state: FormState, patch: Partial<FormState>): FormState {
  return { ...state, ...patch };
}

export function SeriesSheet({
  isOpen,
  scholarId,
  scholarSlug,
  series,
  onClose,
  onSaved,
}: SeriesSheetProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { ability } = useAbility({ isAuthenticated });
  const [state, dispatch] = useReducer(reduce, {
    title: series?.title ?? "",
    description: series?.description ?? "",
    language: series?.language ?? "",
    isSaving: false,
    error: null,
  });

  const { title, description, language, isSaving, error } = state;
  const canSave = ability.can(series ? "update" : "create", subject("Listing", { scholarSlug }));

  const handleSave = async () => {
    if (!title.trim()) {
      dispatch({ error: t("admin.seriesEdit.titleRequired", "Title is required") });
      return;
    }

    dispatch({ isSaving: true, error: null });
    try {
      if (series) {
        await updateSeries(series.id, {
          title,
          description: description || undefined,
          language: (language || undefined) as never,
        });
      } else {
        await createSeries({ scholarId, title, format: "series" });
      }
      onSaved();
    } catch (saveError) {
      dispatch({ error: (saveError as Error).message });
    } finally {
      dispatch({ isSaving: false });
    }
  };

  const titleLabel = series
    ? t("admin.seriesEdit.editTitle", "Edit Series")
    : t("admin.seriesEdit.newTitle", "New Series");

  return (
    <BottomSheet
      isPresented={isOpen}
      onDismiss={onClose}
      showDragIndicator
      snapPoints={["full"]}
      testID="series-sheet"
    >
      <ScrollView showsIndicators={false}>
        <Column
          spacing={theme.spacing.component.gapLg}
          style={{ padding: theme.spacing.component.panelPadding }}
        >
          <Column spacing={theme.spacing.scale.xs}>
            <NativeText variant="titleLg" colorRole="strong">
              {titleLabel}
            </NativeText>
            <NativeText variant="bodySm" colorRole="muted">
              Organize a sequence of recordings for this scholar.
            </NativeText>
          </Column>

          <Column spacing={theme.spacing.component.gapMd}>
            <NativeFormField
              label={t("admin.seriesEdit.titleLabel", "Title *")}
              value={title}
              onChangeText={(nextTitle) => dispatch({ title: nextTitle })}
              testID="series-sheet-title"
            />
            <NativeFormField
              label={t("admin.seriesEdit.descriptionLabel", "Description")}
              value={description}
              onChangeText={(nextDescription) => dispatch({ description: nextDescription })}
              multiline
              numberOfLines={3}
              testID="series-sheet-description"
            />
            <NativeFormField
              label={t("admin.seriesEdit.languageLabel", "Language")}
              value={language}
              onChangeText={(nextLanguage) => dispatch({ language: nextLanguage })}
              placeholder="e.g. ar, en"
              testID="series-sheet-language"
            />
            {error ? (
              <NativeText variant="bodySm" colorRole="danger">
                {error}
              </NativeText>
            ) : null}
          </Column>

          <Row alignment="end" spacing={theme.spacing.component.gapSm}>
            <NativeButton label={t("common.cancel", "Cancel")} variant="ghost" onPress={onClose} />
            <NativeButton
              label={t("common.save", "Save")}
              icon="success"
              loading={isSaving}
              disabled={isSaving || !canSave}
              onPress={() => void handleSave()}
            />
          </Row>
        </Column>
      </ScrollView>
    </BottomSheet>
  );
}
