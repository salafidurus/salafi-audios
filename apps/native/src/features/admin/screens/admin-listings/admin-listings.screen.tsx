import type { AdminListingListItemDto, AppAbility } from "@sd/core-contracts";

import { Column, RNHostView, Row } from "@expo/ui";
import { MenuView, type MenuAction, type NativeActionEvent } from "@expo/ui/community/menu";
import { useAbility } from "@sd/domain-account";
import { useFormattedScholarName } from "@sd/domain-content";
import { Stack } from "expo-router";
import { useCallback, useState } from "react";
import { useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { getThemedSearchBarOptions } from "@/features/navigation/utils/search-bar-options";
import {
  NativeButton,
  NativeList,
  NativeListItem,
  NativeScreenHost,
  NativeStateView,
} from "@/shared/ui";

import { bulkListingAction } from "../../api/admin-listings.api";
import { AudioUploaderSheet } from "../../components/AudioUploaderSheet/AudioUploaderSheet";
import { BulkActionBar } from "../../components/BulkActionBar/BulkActionBar";
import { ListingEditSheet } from "../../components/ListingEditSheet/ListingEditSheet";
import { useAdminListings } from "../../hooks/use-admin-listings";
import { filterListings } from "./filter-listings";

type AdminListingRowProps = {
  item: AdminListingListItemDto;
  isSelected: boolean;
  actions: MenuAction[];
  onPress: () => void;
  onAction: (action: string) => void;
};

/**
 * The list endpoint already scope-filters rows server-side, and
 * AdminListingListItemDto carries scholarSlug (not scholarId), so these are
 * bare ability checks rather than scholarId-conditioned ones — same
 * trade-off web's admin Listing.tsx made in Stage 8.
 */
function getVisibleRowActions(ability: AppAbility): MenuAction[] {
  const actions: MenuAction[] = [];
  if (ability.can("update", "Listing")) actions.push({ id: "edit", title: "Edit" });
  if (ability.can("publish", "Listing")) actions.push({ id: "publish", title: "Publish" });
  if (ability.can("archive", "Listing")) actions.push({ id: "archive", title: "Archive" });
  return actions;
}

function AdminListingRow({ item, isSelected, actions, onPress, onAction }: AdminListingRowProps) {
  const scholarName = useFormattedScholarName(item.scholarName, item.scholarSlug);

  return (
    <MenuView
      testID={`admin-listing-row-${item.id}`}
      actions={actions}
      shouldOpenOnLongPress
      onPressAction={(event: NativeActionEvent) => onAction(event.nativeEvent.event)}
    >
      <NativeListItem
        title={item.title}
        supportingText={`${scholarName} · ${item.status}`}
        leadingIcon={isSelected ? "check" : "play"}
        onPress={onPress}
        testID={`admin-listing-row-${item.id}-trigger`}
      />
    </MenuView>
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
  const [searchQuery, setSearchQuery] = useState("");
  const listings = filterListings(data?.items ?? [], searchQuery);
  const rowActions = getVisibleRowActions(ability);
  const canUpload = ability.can("upload", "Media");
  const canPublish = ability.can("publish", "Listing");
  const canArchive = ability.can("archive", "Listing");

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
    (id: string) => {
      if (selectedIds.size > 0) {
        toggleSelect(id);
      } else {
        setEditingListingId(id);
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

  const handleRowAction = async (id: string, action: string) => {
    if (action === "edit") {
      setEditingListingId(id);
      return;
    }
    if (action === "publish" || action === "archive") {
      try {
        await bulkListingAction({ action, ids: [id] });
      } catch {
        // Ignored for UX robustness
      }
      refetch();
    }
  };

  return (
    <NativeScreenHost testID="admin-listings-host">
      <Stack.Screen options={headerSearchOptions} />
      <Column
        spacing={theme.spacing.component.gapLg}
        style={{
          width: "100%",
          padding: theme.spacing.layout.pageX,
        }}
      >
        {canUpload ? (
          <Row alignment="end">
            <NativeButton
              label="Upload"
              icon="add"
              onPress={() => setShowUploader(true)}
              testID="admin-listings-upload"
            />
          </Row>
        ) : null}
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
                actions={rowActions}
                onPress={() => handleRowPress(item.id)}
                onAction={(action) => void handleRowAction(item.id, action)}
              />
            ))}
          </NativeList>
        )}
      </Column>

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

      <RNHostView matchContents>
        <AudioUploaderSheet
          isOpen={showUploader}
          onClose={() => setShowUploader(false)}
          onUploadComplete={() => {
            setShowUploader(false);
            refetch();
          }}
        />
      </RNHostView>

      <RNHostView matchContents>
        <ListingEditSheet
          listingId={editingListingId}
          onClose={() => setEditingListingId(null)}
          onSaved={() => {
            setEditingListingId(null);
            refetch();
          }}
        />
      </RNHostView>
    </NativeScreenHost>
  );
}
