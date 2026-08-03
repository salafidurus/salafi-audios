import { BottomSheet, Column, Row } from "@expo/ui";
import { endpoints, httpClient, type TranslationViewDto } from "@sd/core-contracts";
import { useEffect, useRef, useState } from "react";
import { useUnistyles } from "react-native-unistyles";

import { NativeButton, NativeFormField, NativeStateView, NativeText } from "@/shared/ui";

import { fetchAdminListingDetail } from "../../api/admin-listings.api";

export function ListingTranslationSheet({
  listingId,
  onClose,
  onSaved,
}: {
  listingId: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { theme } = useUnistyles();
  const [items, setItems] = useState<TranslationViewDto[] | null>(null);
  const listingSlug = useRef<string | null>(null);
  const [locale, setLocale] = useState("en");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!listingId) return;
    setItems(null);
    listingSlug.current = null;
    fetchAdminListingDetail(listingId)
      .then(async (listing) => {
        listingSlug.current = listing.slug;
        return httpClient<TranslationViewDto[]>({
          url: endpoints.translations.listings.list(listing.slug),
          method: "GET",
        });
      })
      .then((data) => {
        setItems(data);
        const current = data[0];
        if (current) {
          setLocale(current.locale);
          setTitle(current.fields.title ?? "");
        }
      });
  }, [listingId]);
  const save = async () => {
    if (!listingSlug.current) return;
    setSaving(true);
    try {
      await httpClient({
        url: endpoints.translations.listings.save(listingSlug.current),
        method: "POST",
        body: { locale, title },
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };
  if (!listingId) return null;

  return (
    <BottomSheet
      isPresented={listingId != null}
      onDismiss={onClose}
      snapPoints={["half"]}
      testID="listing-translation-sheet"
    >
      <Column
        spacing={theme.spacing.component.gapMd}
        style={{ padding: theme.spacing.component.panelPadding }}
      >
        <NativeText variant="titleMd" colorRole="strong">
          Translations
        </NativeText>
        {items === null ? (
          <NativeStateView kind="loading" title="Loading translations…" />
        ) : (
          <>
            <NativeFormField
              label="Locale"
              value={locale}
              onChangeText={setLocale}
              placeholder="e.g. en"
              testID="listing-translation-locale"
            />
            <NativeFormField
              label="Title"
              value={title}
              onChangeText={setTitle}
              testID="listing-translation-title"
            />
            <Row alignment="end" spacing={theme.spacing.component.gapSm}>
              <NativeButton label="Cancel" variant="ghost" onPress={onClose} />
              <NativeButton
                label="Save translation"
                icon="success"
                loading={saving}
                onPress={() => void save()}
              />
            </Row>
          </>
        )}
      </Column>
    </BottomSheet>
  );
}
