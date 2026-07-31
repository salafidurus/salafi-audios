import type { MenuAction } from "@expo/ui/community/menu";

import { Stack } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { getThemedSearchBarOptions } from "@/features/navigation/utils/search-bar-options";
import { AppText } from "@/shared/components/AppText/AppText";
import { List } from "@/shared/components/List";

import { bulkListingAction } from "../../api/admin-listings.api";
import { AudioUploaderSheet } from "../../components/AudioUploaderSheet/AudioUploaderSheet";
import { BulkActionBar } from "../../components/BulkActionBar/BulkActionBar";
import { ListingEditSheet } from "../../components/ListingEditSheet/ListingEditSheet";
import { useAdminListings } from "../../hooks/use-admin-listings";
import { filterListings } from "./filter-listings";

export function AdminListingsScreen() {
  const { theme } = useUnistyles();
  const { data, isLoading, refetch } = useAdminListings();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const listings = filterListings(data?.items ?? [], searchQuery);

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
          <Pressable onPress={() => setShowUploader(true)} style={styles.uploadBtn}>
            <AppText variant="labelMd" style={styles.uploadBtnText}>
              + Upload
            </AppText>
          </Pressable>
        </View>

        {isLoading ? (
          <AppText variant="bodyMd" style={styles.loadingText}>
            Loading…
          </AppText>
        ) : (
          <List>
            {listings.map((item, index) => {
              const isSelected = selectedIds.has(item.id);
              const actions: MenuAction[] = [
                { id: "edit", title: "Edit" },
                { id: "publish", title: "Publish" },
                { id: "archive", title: "Archive" },
              ];
              return (
                <List.Item
                  key={item.id}
                  testID={`admin-listing-row-${item.id}`}
                  onPress={() => handleRowPress(item.id)}
                  hideBorder={index === listings.length - 1}
                  style={isSelected ? styles.rowSelected : undefined}
                >
                  <View style={styles.rowContent}>
                    <AppText numberOfLines={1} variant="bodyMd" style={styles.rowTitle}>
                      {item.title}
                    </AppText>
                    <AppText variant="caption" style={styles.rowMeta}>
                      {item.scholarName} · {item.status}
                    </AppText>
                  </View>
                  <List.Item.Actions
                    actions={actions}
                    onAction={(action) => void handleRowAction(item.id, action)}
                  />
                </List.Item>
              );
            })}
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
