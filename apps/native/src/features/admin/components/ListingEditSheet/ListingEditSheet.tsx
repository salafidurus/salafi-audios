import type { AdminListingDetailDto, Locale } from "@sd/core-contracts";

import { subject } from "@casl/ability";
import { BottomSheet, Column, Row, ScrollView } from "@expo/ui";
import { useAbility } from "@sd/domain-account";
import { useEffect, useReducer } from "react";
import { useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { NativeButton, NativeFormField, NativeStateView, NativeText } from "@/shared/ui";

import { fetchAdminListingDetail, updateListing } from "../../api/admin-listings.api";

type ListingEditSheetProps = {
  listingId: string | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  listing: AdminListingDetailDto | null;
  title: string;
  description: string;
  language: string;
  isSaving: boolean;
  error: string | null;
};

function reduce(state: FormState, patch: Partial<FormState>): FormState {
  return { ...state, ...patch };
}

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
    if (!listingId) {
      dispatch({ listing: null, error: null });
      return;
    }

    fetchAdminListingDetail(listingId).then((listing) => {
      dispatch({
        listing,
        title: listing.title ?? "",
        description: listing.description ?? "",
        language: listing.language ?? "",
        error: null,
      });
    });
  }, [listingId]);

  const { listing, title, description, language, isSaving, error } = state;
  const canSave = listing
    ? ability.can("update", subject("Listing", { scholarSlug: listing.scholarSlug }))
    : false;

  const handleSave = async () => {
    if (!listing) return;

    dispatch({ isSaving: true, error: null });
    try {
      await updateListing(listing.id, {
        title,
        ...(description ? { description } : {}),
        ...(language ? { language: language as Locale } : {}),
      });
      onSaved();
    } catch (saveError) {
      dispatch({ error: (saveError as Error).message });
    } finally {
      dispatch({ isSaving: false });
    }
  };

  return (
    <BottomSheet
      isPresented={listingId != null}
      onDismiss={onClose}
      showDragIndicator
      snapPoints={["full"]}
      testID="listing-edit-sheet"
    >
      <ScrollView showsIndicators={false}>
        <Column
          spacing={theme.spacing.component.gapLg}
          style={{ padding: theme.spacing.component.panelPadding }}
        >
          <Column spacing={theme.spacing.scale.xs}>
            <NativeText variant="titleLg" colorRole="strong">
              {t("admin.listingEdit.title", "Edit Listing")}
            </NativeText>
            <NativeText variant="bodySm" colorRole="muted">
              Update the listing details shown to listeners.
            </NativeText>
          </Column>

          {!listing ? (
            <NativeStateView kind="loading" title="Loading listing…" />
          ) : (
            <Column spacing={theme.spacing.component.gapMd}>
              <NativeFormField
                label={t("admin.listingEdit.titleLabel", "Title")}
                value={title}
                onChangeText={(nextTitle) => dispatch({ title: nextTitle })}
                testID="listing-edit-title"
              />
              <NativeFormField
                label={t("admin.listingEdit.descriptionLabel", "Description")}
                value={description}
                onChangeText={(nextDescription) => dispatch({ description: nextDescription })}
                multiline
                numberOfLines={3}
                testID="listing-edit-description"
              />
              <NativeFormField
                label={t("admin.listingEdit.languageLabel", "Language")}
                value={language}
                onChangeText={(nextLanguage) => dispatch({ language: nextLanguage })}
                placeholder="e.g. ar, en"
                testID="listing-edit-language"
              />
              <NativeText variant="bodySm" colorRole="muted">
                {`${t("admin.listingEdit.status", "Status")}: ${listing.status}`}
              </NativeText>
              {error ? (
                <NativeText variant="bodySm" colorRole="danger">
                  {error}
                </NativeText>
              ) : null}
            </Column>
          )}

          <Row alignment="end" spacing={theme.spacing.component.gapSm}>
            <NativeButton label={t("common.cancel", "Cancel")} variant="ghost" onPress={onClose} />
            <NativeButton
              label={t("common.save", "Save")}
              icon="success"
              loading={isSaving}
              disabled={isSaving || !listing || !canSave}
              onPress={() => void handleSave()}
            />
          </Row>
        </Column>
      </ScrollView>
    </BottomSheet>
  );
}
