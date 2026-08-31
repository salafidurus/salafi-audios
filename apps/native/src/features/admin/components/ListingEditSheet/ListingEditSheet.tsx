import type { AdminListingDetailDto, Locale } from "@sd/core-contracts";

import { subject } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { useEffect, useReducer } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components/AppText/AppText";
import { Button } from "@/shared/components/Button/Button";
import { TextInput } from "@/shared/components/TextInput/TextInput";

import { fetchAdminListingDetail, updateListing } from "../../api/admin-listings.api";

/** Provides authenticated native administration workflows and their data boundaries. */
type ListingEditSheetProps = {
  listingId: string | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  listing: AdminListingDetailDto | null;
  title: string;
  description: string;
  /** Stores the selected content locale used for validation, display, and persistence. */
  language: string;
  isSaving: boolean;
  /** Stores the user-facing or diagnostic failure associated with the current operation. */
  error: string | null;
};

function reduce(state: FormState, patch: Partial<FormState>): FormState {
  return { ...state, ...patch };
}

function parseLocaleInput(language: string): Locale | undefined {
  return language === "ar" || language === "en" ? language : undefined;
}

function getErrorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : "Unable to save listing";
}

async function saveListingChanges(
  listing: AdminListingDetailDto,
  title: string,
  description: string,
  language: string,
  dispatch: (patch: Partial<FormState>) => void,
  onSaved: () => void,
): Promise<void> {
  dispatch({ isSaving: true, error: null });
  try {
    const update = {
      title,
      description: description || undefined,
      language: parseLocaleInput(language),
      /** Stores the selected content locale used for validation, display, and persistence. */
    } satisfies {
      title: string;
      description?: string;
      /** Stores the selected content locale used for validation, display, and persistence. */
      language?: Locale;
    };
    await updateListing(listing.id, update);
    onSaved();
  } catch (cause) {
    dispatch({ error: getErrorMessage(cause) });
  } finally {
    dispatch({ isSaving: false });
  }
}

function canSaveListing(
  listing: AdminListingDetailDto | null,
  ability: ReturnType<typeof useAbility>["ability"],
): boolean {
  if (!listing) return false;
  return ability.can("update", subject("Listing", { scholarSlug: listing.scholarSlug }));
}

/** Renders the native listing edit sheet surface and coordinates its user-facing state. */
export function ListingEditSheet({ listingId, onClose, onSaved }: ListingEditSheetProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { ability } = useAbility({ isAuthenticated });
  const [state, dispatch] = useReducer(reduce, {
    listing: null,
    title: "",
    description: "",
    language: "",
    isSaving: false,
    error: null,
  });

  useEffect(() => {
    // react-doctor-disable-next-line react-doctor/no-event-handler
    if (!listingId) {
      dispatch({ listing: null });
      return;
    }
    fetchAdminListingDetail(listingId).then((data) => {
      dispatch({
        listing: data,
        title: data.title ?? "",
        description: data.description ?? "",
        language: data.language ?? "",
      });
    });
  }, [listingId]);

  if (!listingId) return null;

  const { listing, title, description, language, isSaving, error } = state;
  const canSave = canSaveListing(listing, ability);

  const handleSave = async () => {
    if (!listing) return;
    await saveListingChanges(listing, title, description, language, dispatch, onSaved);
  };

  return (
    <View style={styles.container}>
      <AppText variant="titleLg" style={styles.title}>
        {t("admin.listingEdit.title", "Edit Listing")}
      </AppText>
      {!listing ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppText variant="labelMd" style={styles.label}>
            {t("admin.listingEdit.titleLabel", "Title")}
          </AppText>
          <TextInput
            value={title}
            onChangeText={(v) => dispatch({ title: v })}
            style={styles.input}
          />
          <AppText variant="labelMd" style={styles.label}>
            {t("admin.listingEdit.descriptionLabel", "Description")}
          </AppText>
          <TextInput
            value={description}
            onChangeText={(v) => dispatch({ description: v })}
            multiline
            numberOfLines={3}
            style={styles.input}
          />
          <AppText variant="labelMd" style={styles.label}>
            {t("admin.listingEdit.languageLabel", "Language")}
          </AppText>
          <TextInput
            value={language}
            onChangeText={(v) => dispatch({ language: v })}
            placeholder="e.g. ar, en"
            placeholderTextColor={theme.colors.content.muted}
            style={styles.input}
          />
          <AppText variant="bodySm" style={styles.statusText}>
            {t("admin.listingEdit.status", "Status")}: {listing.status}
          </AppText>
          {error && (
            <AppText variant="bodySm" style={styles.errorText}>
              {error}
            </AppText>
          )}
        </ScrollView>
      )}
      <View style={styles.buttonRow}>
        <Button
          label={t("common.save", "Save")}
          onPress={handleSave}
          loading={isSaving}
          disabled={!listing || !canSave}
          style={styles.saveBtn}
        />
        <Button
          label={t("common.cancel", "Cancel")}
          onPress={onClose}
          variant="ghost"
          style={styles.cancelBtn}
        />
      </View>
    </View>
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
    maxHeight: "85%",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: theme.spacing.scale.lg,
    color: theme.colors.content.strong,
  },
  loader: {
    marginVertical: theme.spacing.scale["3xl"],
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
  statusText: {
    fontSize: 12,
    color: theme.colors.content.muted,
    marginBottom: theme.spacing.scale.md,
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
