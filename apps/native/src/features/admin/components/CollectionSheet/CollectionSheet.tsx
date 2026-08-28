import type { AdminListingDetailDto, Locale } from "@sd/core-contracts";

import { subject } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { useReducer } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { TextInput } from "@/shared/components/TextInput/TextInput";

import { createCollection, updateCollection } from "../../api/admin-scholars.api";

/** Provides the native features admin components CollectionSheet CollectionSheet module responsibility. */
type CollectionSheetProps = {
  isOpen: boolean;
  scholarId: string;
  /** Describes the scholarSlug native contract and behavior. */
  scholarSlug: string;
  collection?: AdminListingDetailDto;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  title: string;
  description: string;
  /** Describes the language native contract and behavior. */
  language: string;
  isSaving: boolean;
  /** Describes the error native contract and behavior. */
  error: string | null;
};

function reduce(state: FormState, patch: Partial<FormState>): FormState {
  return { ...state, ...patch };
}

function parseLocaleInput(language: string): Locale | undefined {
  return language === "ar" || language === "en" ? language : undefined;
}

function getErrorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : "Unable to save collection";
}

async function saveCollection(
  state: FormState,
  collection: AdminListingDetailDto | undefined,
  scholarId: string,
  dispatch: (patch: Partial<FormState>) => void,
  onSaved: () => void,
  t: ReturnType<typeof useTranslation>["t"],
): Promise<void> {
  if (!state.title.trim()) {
    dispatch({ error: t("admin.collectionEdit.titleRequired", "Title is required") });
    return;
  }
  dispatch({ isSaving: true, error: null });
  try {
    if (collection) {
      await updateCollection(collection.id, {
        title: state.title,
        description: state.description || undefined,
        language: parseLocaleInput(state.language),
      });
    } else {
      await createCollection({ scholarId, title: state.title, format: "collection" });
    }
    onSaved();
  } catch (cause) {
    dispatch({ error: getErrorMessage(cause) });
  } finally {
    dispatch({ isSaving: false });
  }
}

function getInitialFormState(collection: AdminListingDetailDto | undefined): FormState {
  return {
    title: collection?.title ?? "",
    description: collection?.description ?? "",
    language: collection?.language ?? "",
    isSaving: false,
    error: null,
  };
}

function CollectionSheetForm({
  state,
  collection,
  canSave,
  theme,
  t,
  onSave,
  onClose,
  dispatch,
}: {
  /** Describes the state native contract and behavior. */
  state: FormState;
  collection: AdminListingDetailDto | undefined;
  canSave: boolean;
  theme: ReturnType<typeof useUnistyles>["theme"];
  t: ReturnType<typeof useTranslation>["t"];
  onSave: () => Promise<void>;
  onClose: () => void;
  dispatch: (patch: Partial<FormState>) => void;
}) {
  const { title, description, language, isSaving, error } = state;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {collection
          ? t("admin.collectionEdit.editTitle", "Edit Collection")
          : t("admin.collectionEdit.newTitle", "New Collection")}
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>{t("admin.collectionEdit.titleLabel", "Title *")}</Text>
        <TextInput
          value={title}
          onChangeText={(v) => dispatch({ title: v })}
          style={styles.input}
        />
        <Text style={styles.label}>
          {t("admin.collectionEdit.descriptionLabel", "Description")}
        </Text>
        <TextInput
          value={description}
          onChangeText={(v) => dispatch({ description: v })}
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <Text style={styles.label}>{t("admin.collectionEdit.languageLabel", "Language")}</Text>
        <TextInput
          value={language}
          onChangeText={(v) => dispatch({ language: v })}
          placeholder="e.g. ar, en"
          placeholderTextColor={theme.colors.content.muted}
          style={styles.input}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
      <View style={styles.buttonRow}>
        <Pressable onPress={onSave} disabled={isSaving || !canSave} style={styles.saveBtn}>
          {isSaving ? (
            <ActivityIndicator color={theme.colors.content.onPrimary} />
          ) : (
            <Text style={styles.saveBtnText}>{t("common.save", "Save")}</Text>
          )}
        </Pressable>
        <Pressable onPress={onClose} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>{t("common.cancel", "Cancel")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Describes the CollectionSheet native contract and behavior. */
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
  const [state, dispatch] = useReducer(reduce, collection, getInitialFormState);

  if (!isOpen) return null;

  const canSave = ability.can(
    collection ? "update" : "create",
    subject("Listing", { scholarSlug }),
  );

  const handleSave = () => saveCollection(state, collection, scholarId, dispatch, onSaved, t);

  return (
    <CollectionSheetForm
      state={state}
      collection={collection}
      canSave={canSave}
      theme={theme}
      t={t}
      onSave={handleSave}
      onClose={onClose}
      dispatch={dispatch}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface.elevated,
    borderTopLeftRadius: theme.radius.scale.lg,
    borderTopRightRadius: theme.radius.scale.lg,
    padding: theme.spacing.scale.lg,
    maxHeight: "80%",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: theme.spacing.scale.lg,
    color: theme.colors.content.strong,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: theme.spacing.scale.xs,
    color: theme.colors.content.default,
  },
  input: {
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.scale.sm,
    paddingVertical: theme.spacing.scale.sm,
    paddingHorizontal: theme.spacing.scale.md,
    marginBottom: theme.spacing.scale.md,
    color: theme.colors.content.default,
  },
  errorText: {
    color: theme.colors.state.danger,
    marginBottom: theme.spacing.scale.sm,
  },
  buttonRow: {
    flexDirection: "row",
    gap: theme.spacing.scale.sm,
    marginTop: theme.spacing.scale.md,
  },
  saveBtn: {
    flex: 1,
    padding: theme.spacing.scale.md,
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radius.scale.sm,
    alignItems: "center",
  },
  saveBtnText: {
    color: theme.colors.content.onPrimary,
    fontWeight: "600",
  },
  cancelBtn: {
    padding: theme.spacing.scale.md,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.scale.sm,
    alignItems: "center",
  },
  cancelBtnText: {
    color: theme.colors.content.default,
  },
}));
