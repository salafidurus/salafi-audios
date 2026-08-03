import type { AdminListingListItemDto } from "@sd/core-contracts";

import { Column, RNHostView } from "@expo/ui";
import { useAbility } from "@sd/domain-account";
import { useFormattedScholarName } from "@sd/domain-content";
import { Stack } from "expo-router";
import { useCallback, useState } from "react";
import { useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { getThemedSearchBarOptions } from "@/features/navigation/utils/search-bar-options";
import {
  NativeIcon,
  NativeList,
  NativeListItem,
  NativeScreenHost,
  NativeStateView,
} from "@/shared/ui";

import { bulkListingAction } from "../../api/admin-listings.api";
import { AdminActionSheet } from "../../components/AdminActionSheet/AdminActionSheet";
import { AdminFloatingAction } from "../../components/AdminFloatingAction/AdminFloatingAction";
import { AudioUploaderSheet } from "../../components/AudioUploaderSheet/AudioUploaderSheet";
import { BulkActionBar } from "../../components/BulkActionBar/BulkActionBar";
import { ListingEditSheet } from "../../components/ListingEditSheet/ListingEditSheet";
import { ListingTranslationSheet } from "../../components/ListingTranslationSheet/ListingTranslationSheet";
import { useAdminListings } from "../../hooks/use-admin-listings";
import { filterListings } from "./filter-listings";

type AdminListingRowProps = {
  item: AdminListingListItemDto;
  isSelected: boolean;
  onPress: (item: AdminListingListItemDto) => void;
};

function AdminListingRow({ item, isSelected, onPress }: AdminListingRowProps) {
  const scholarName = useFormattedScholarName(item.scholarName, item.scholarSlug);

  return (
    <NativeListItem
      title={item.title}
      supportingText={`${scholarName} · ${item.status}`}
      leadingIcon={isSelected ? "check" : "play"}
      trailing={<NativeIcon name="more" colorRole="muted" />}
      onPress={() => onPress(item)}
      testID={`admin-listing-row-${item.id}-trigger`}
    />
  );
}

export function AdminListingsScreen() {
  const { theme } = useUnistyles();
  const { isAuthenticated } = useAuth();
  const { ability } = useAbility({ isAuthenticated });
  const { data, isLoading, refetch } = useAdminListings();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [actionListing, setActionListing] = useState<AdminListingListItemDto | null>(null);
  const [translationListingId, setTranslationListingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const listings = filterListings(data?.items ?? [], searchQuery);
  const canCreateListing = ability.can("create", "Listing");
  const canPublish = ability.can("publish", "Listing");
  const canArchive = ability.can("archive", "Listing");
  const canUpdateListing = ability.can("update", "Listing");
  const canReadTranslations = ability.can("read", "Translation");

  const headerSearchOptions = {
    headerSearchBarOptions: {
      placeholder: "Search listings...",
      onChangeText: (event: any) => setSearchQuery(event.nativeEvent.text),
      onCancelButtonPress: () => setSearchQuery(""),
      ...getThemedSearchBarOptions(theme),
    },
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRowPress = useCallback(
    (listing: AdminListingListItemDto) => {
      if (selectedIds.size > 0) {
        toggleSelect(listing.id);
      } else {
        setActionListing(listing);
      }
    },
    [selectedIds],
  );

  const handleBulkAction = async (action: "publish" | "archive") => {
    setIsBulkLoading(true);
    try {
      await bulkListingAction({ action, ids: Array.from(selectedIds) });
    } catch {
      // Ignored for UX robustness
    }
    setSelectedIds(new Set());
    setIsBulkLoading(false);
    refetch();
  };

  return (
    <NativeScreenHost testID="admin-listings-host">
      <Stack.Screen options={headerSearchOptions} />
      <AdminFloatingAction isVisible={canCreateListing} onPress={() => setShowUploader(true)}>
        <Column
          spacing={theme.spacing.component.gapLg}
          style={{
            padding: theme.spacing.layout.pageX,
          }}
        >
          {isLoading ? (
            <NativeStateView kind="loading" title="Loading…" />
          ) : listings.length === 0 ? (
            <NativeStateView kind="empty" title="No listings found." />
          ) : (
            <NativeList testID="admin-listings-list">
              {listings.map((item) => (
                <AdminListingRow
                  key={item.id}
                  item={item}
                  isSelected={selectedIds.has(item.id)}
                  onPress={handleRowPress}
                />
              ))}
            </NativeList>
          )}
        </Column>
      </AdminFloatingAction>

      <RNHostView>
        <BulkActionBar
          selectedCount={selectedIds.size}
          onPublish={() => handleBulkAction("publish")}
          onArchive={() => handleBulkAction("archive")}
          canPublish={canPublish}
          canArchive={canArchive}
          isLoading={isBulkLoading}
        />
      </RNHostView>

      <AudioUploaderSheet
        isOpen={showUploader}
        onClose={() => setShowUploader(false)}
        onUploadComplete={() => {
          setShowUploader(false);
          refetch();
        }}
      />

      <ListingEditSheet
        listingId={editingListingId}
        onClose={() => setEditingListingId(null)}
        onSaved={() => {
          setEditingListingId(null);
          refetch();
        }}
      />
      <AdminActionSheet
        isOpen={actionListing != null}
        title="Listing actions"
        onClose={() => setActionListing(null)}
        actions={[
          ...(canUpdateListing
            ? [
                {
                  label: "Edit",
                  icon: "edit" as const,
                  onPress: () => {
                    setEditingListingId(actionListing?.id ?? null);
                    setActionListing(null);
                  },
                },
              ]
            : []),
          ...(canReadTranslations
            ? [
                {
                  label: "Translate",
                  icon: "translate" as const,
                  onPress: () => {
                    setTranslationListingId(actionListing?.id ?? null);
                    setActionListing(null);
                  },
                },
              ]
            : []),
        ]}
      />
      <ListingTranslationSheet
        listingId={translationListingId}
        onClose={() => setTranslationListingId(null)}
        onSaved={() => {
          setTranslationListingId(null);
          refetch();
        }}
      />
    </NativeScreenHost>
  );
}
