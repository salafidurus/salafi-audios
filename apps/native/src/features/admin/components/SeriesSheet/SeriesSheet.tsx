import type { AdminListingDetailDto, Locale } from "@sd/core-contracts";

import { subject } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { useReducer } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { TextInput } from "@/shared/components/TextInput/TextInput";

import { createSeries, updateSeries } from "../../api/admin-scholars.api";

/** Provides the native features admin components SeriesSheet SeriesSheet module responsibility. */
type SeriesSheetProps = {
  isOpen: boolean;
  scholarId: string;
  /** Describes the scholarSlug native field contract and behavior. */
  scholarSlug: string;
  series?: AdminListingDetailDto;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  title: string;
  description: string;
  /** Describes the language native field contract and behavior. */
  language: string;
  isSaving: boolean;
  /** Describes the error native field contract and behavior. */
  error: string | null;
};

function reduce(state: FormState, patch: Partial<FormState>): FormState {
  return { ...state, ...patch };
}

function parseLocaleInput(language: string): Locale | undefined {
  return language === "ar" || language === "en" ? language : undefined;
}

function getErrorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : "Unable to save series";
}

async function saveSeries(
  state: FormState,
  series: AdminListingDetailDto | undefined,
  scholarId: string,
  dispatch: (patch: Partial<FormState>) => void,
  onSaved: () => void,
  t: ReturnType<typeof useTranslation>["t"],
): Promise<void> {
  if (!state.title.trim()) {
    dispatch({ error: t("admin.seriesEdit.titleRequired", "Title is required") });
    return;
  }
  dispatch({ isSaving: true, error: null });
  try {
    if (series) {
      await updateSeries(series.id, {
        title: state.title,
        description: state.description || undefined,
        language: parseLocaleInput(state.language),
      });
    } else {
      await createSeries({ scholarId, title: state.title, format: "series" });
    }
    onSaved();
  } catch (cause) {
    dispatch({ error: getErrorMessage(cause) });
  } finally {
    dispatch({ isSaving: false });
  }
}

function getInitialFormState(series: AdminListingDetailDto | undefined): FormState {
  return {
    title: series?.title ?? "",
    description: series?.description ?? "",
    language: series?.language ?? "",
    isSaving: false,
    error: null,
  };
}

function SeriesSheetForm({
  state,
  series,
  canSave,
  theme,
  t,
  onSave,
  onClose,
  dispatch,
}: {
  /** Describes the state native field contract and behavior. */
  state: FormState;
  series: AdminListingDetailDto | undefined;
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
        {series
          ? t("admin.seriesEdit.editTitle", "Edit Series")
          : t("admin.seriesEdit.newTitle", "New Series")}
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>{t("admin.seriesEdit.titleLabel", "Title *")}</Text>
        <TextInput
          value={title}
          onChangeText={(v) => dispatch({ title: v })}
          style={styles.input}
        />
        <Text style={styles.label}>{t("admin.seriesEdit.descriptionLabel", "Description")}</Text>
        <TextInput
          value={description}
          onChangeText={(v) => dispatch({ description: v })}
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <Text style={styles.label}>{t("admin.seriesEdit.languageLabel", "Language")}</Text>
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

/** Describes the SeriesSheet native function contract and behavior. */
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
  const [state, dispatch] = useReducer(reduce, series, getInitialFormState);

  if (!isOpen) return null;

  const canSave = ability.can(series ? "update" : "create", subject("Listing", { scholarSlug }));

  const handleSave = () => saveSeries(state, series, scholarId, dispatch, onSaved, t);

  return (
    <SeriesSheetForm
      state={state}
      series={series}
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
