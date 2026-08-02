import type { MenuAction } from "@expo/ui/community/menu";
import type { AdminListingListItemDto, AppAbility } from "@sd/core-contracts";

import { useAbility } from "@sd/domain-account";
import { useFormattedScholarName } from "@sd/domain-content";
import { Stack } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { getThemedSearchBarOptions } from "@/features/navigation/utils/search-bar-options";
import { AppText } from "@/shared/components/AppText/AppText";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { List } from "@/shared/components/List";
import { MarqueeText } from "@/shared/components/MarqueeText";

import { bulkListingAction } from "../../api/admin-listings.api";
import { AudioUploaderSheet } from "../../components/AudioUploaderSheet/AudioUploaderSheet";
import { BulkActionBar } from "../../components/BulkActionBar/BulkActionBar";
import { ListingEditSheet } from "../../components/ListingEditSheet/ListingEditSheet";
import { useAdminListings } from "../../hooks/use-admin-listings";
import { filterListings } from "./filter-listings";

type AdminListingRowProps = {
  item: AdminListingListItemDto;
  isSelected: boolean;
  hideBorder: boolean;
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

function AdminListingRow({
  item,
  isSelected,
  hideBorder,
  actions,
  onPress,
  onAction,
}: AdminListingRowProps) {
  const scholarName = useFormattedScholarName(item.scholarName, item.scholarSlug);

  return (
    <List.Item
      testID={`admin-listing-row-${item.id}`}
      onPress={onPress}
      hideBorder={hideBorder}
      style={isSelected ? styles.rowSelected : undefined}
    >
      <View style={styles.rowContent}>
        <MarqueeText text={item.title} variant="bodyMd" style={styles.rowTitle} />
        <AppText variant="caption" style={styles.rowMeta}>
          {scholarName} · {item.status}
        </AppText>
      </View>
      <List.Item.Actions actions={actions} onAction={onAction} />
    </List.Item>
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
    <View style={styles.screen}>
      <Stack.Screen options={headerSearchOptions} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <AppText variant="titleLg">Listings</AppText>
          {canUpload ? (
            <Pressable onPress={() => setShowUploader(true)} style={styles.uploadBtn}>
              <AppText variant="labelMd" style={styles.uploadBtnText}>
                + Upload
              </AppText>
            </Pressable>
          ) : null}
        </View>

        {isLoading ? (
          <EmptyState message="Loading…" variant="loading" />
        ) : listings.length === 0 ? (
          <EmptyState message="No listings found." variant="empty" />
        ) : (
          <List>
            {listings.map((item, index) => (
              <AdminListingRow
                key={item.id}
                item={item}
                isSelected={selectedIds.has(item.id)}
                hideBorder={index === listings.length - 1}
                actions={rowActions}
                onPress={() => handleRowPress(item.id)}
                onAction={(action) => void handleRowAction(item.id, action)}
              />
            ))}
          </List>
        )}
      </ScrollView>

      <BulkActionBar
        selectedCount={selectedIds.size}
        onPublish={() => handleBulkAction("publish")}
        onArchive={() => handleBulkAction("archive")}
        isLoading={isBulkLoading}
      />

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
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.canvas,
  },
  scrollContent: {
    padding: theme.spacing.scale.md,
    paddingBottom: 80,
  },
  header: {
    paddingVertical: theme.spacing.scale.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  uploadBtn: {
    paddingVertical: theme.spacing.scale.sm,
    paddingHorizontal: theme.spacing.scale.md,
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radius.scale.sm,
  },
  uploadBtnText: {
    color: theme.colors.content.onPrimary,
    fontWeight: "600",
  },
  loadingText: {
    textAlign: "center",
    marginTop: theme.spacing.scale["3xl"],
    color: theme.colors.content.muted,
  },
  rowContent: {
    gap: theme.spacing.scale.xs,
  },
  rowSelected: {
    backgroundColor: theme.colors.surface.primarySubtle,
  },
  rowTitle: {
    fontWeight: "600",
    color: theme.colors.content.strong,
  },
  rowMeta: {
    color: theme.colors.content.muted,
  },
}));
