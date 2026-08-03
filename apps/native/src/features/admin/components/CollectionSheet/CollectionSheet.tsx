import type { AdminListingDetailDto } from "@sd/core-contracts";

import { subject } from "@casl/ability";
import { BottomSheet, Column, Row, ScrollView } from "@expo/ui";
import { useAbility } from "@sd/domain-account";
import { useReducer } from "react";
import { useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { NativeButton, NativeFormField, NativeText } from "@/shared/ui";

import { createCollection, updateCollection } from "../../api/admin-scholars.api";

type CollectionSheetProps = {
  isOpen: boolean;
  scholarId: string;
  scholarSlug: string;
  collection?: AdminListingDetailDto;
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

export function CollectionSheet({
  isOpen,
  scholarId,
  scholarSlug,
  collection,
  onClose,
  onSaved,
}: CollectionSheetProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { ability } = useAbility({ isAuthenticated });
  const [state, dispatch] = useReducer(reduce, {
    title: collection?.title ?? "",
    description: collection?.description ?? "",
    language: collection?.language ?? "",
    isSaving: false,
    error: null,
  });

  const { title, description, language, isSaving, error } = state;
  const canSave = ability.can(
    collection ? "update" : "create",
    subject("Listing", { scholarSlug }),
  );

  const handleSave = async () => {
    if (!title.trim()) {
      dispatch({ error: t("admin.collectionEdit.titleRequired", "Title is required") });
      return;
    }

    dispatch({ isSaving: true, error: null });
    try {
      if (collection) {
        await updateCollection(collection.id, {
          title,
          description: description || undefined,
          language: (language || undefined) as never,
        });
      } else {
        await createCollection({ scholarId, title, format: "collection" });
      }
      onSaved();
    } catch (saveError) {
      dispatch({ error: (saveError as Error).message });
    } finally {
      dispatch({ isSaving: false });
    }
  };

  const titleLabel = collection
    ? t("admin.collectionEdit.editTitle", "Edit Collection")
    : t("admin.collectionEdit.newTitle", "New Collection");

  return (
    <BottomSheet
      isPresented={isOpen}
      onDismiss={onClose}
      showDragIndicator
      snapPoints={["full"]}
      testID="collection-sheet"
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
              Group related audio into a collection for this scholar.
            </NativeText>
          </Column>

          <Column spacing={theme.spacing.component.gapMd}>
            <NativeFormField
              label={t("admin.collectionEdit.titleLabel", "Title *")}
              value={title}
              onChangeText={(nextTitle) => dispatch({ title: nextTitle })}
              testID="collection-sheet-title"
            />
            <NativeFormField
              label={t("admin.collectionEdit.descriptionLabel", "Description")}
              value={description}
              onChangeText={(nextDescription) => dispatch({ description: nextDescription })}
              multiline
              numberOfLines={3}
              testID="collection-sheet-description"
            />
            <NativeFormField
              label={t("admin.collectionEdit.languageLabel", "Language")}
              value={language}
              onChangeText={(nextLanguage) => dispatch({ language: nextLanguage })}
              placeholder="e.g. ar, en"
              testID="collection-sheet-language"
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
