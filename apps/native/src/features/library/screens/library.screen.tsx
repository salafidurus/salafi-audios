import { useProgressStore } from "@sd/domain-audio";
import {
  markUnsaved,
  useLibraryCompletedScreen,
  useLibraryProgressScreen,
  useLibrarySavedScreen,
} from "@sd/domain-content";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { LibraryItemRow } from "@/features/library/components/library-item-row/library-item-row";
import { LibraryItemRowSkeleton } from "@/features/library/components/library-item-row/library-item-row-skeleton";
import {
  LibrarySubTabPills,
  type LibrarySub,
} from "@/features/library/components/library-sub-tab-pills/library-sub-tab-pills";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { List } from "@/shared/components/List";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

import { useAuth } from "../../../core/auth/use-auth";
import { useTranslation } from "../../../core/i18n/use-translation";

export type LibraryScreenProps = {
  onNavigateToListing?: (slug: string) => void;
};

export function LibraryScreen({ onNavigateToListing }: LibraryScreenProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [activeSub, setActiveSub] = useState<LibrarySub>("started");

  const handleTabChange = (sub: LibrarySub) => {
    setActiveSub(sub);
  };

  if (!isAuthenticated) {
    return (
      <ScreenView center>
        <EmptyState
          message={t("library.authRequired", "Sign in to access your library")}
          variant="empty"
        />
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <View style={styles.pillsContainer}>
        <LibrarySubTabPills active={activeSub} onChange={handleTabChange} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {activeSub === "started" && <StartedTabContent onNavigateToListing={onNavigateToListing} />}
        {activeSub === "saved" && <SavedTabContent onNavigateToListing={onNavigateToListing} />}
        {activeSub === "completed" && (
          <CompletedTabContent onNavigateToListing={onNavigateToListing} />
        )}
      </ScrollView>
    </ScreenView>
  );
}

function StartedTabContent({
  onNavigateToListing,
}: {
  onNavigateToListing?: (slug: string) => void;
}) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { items, isFetching } = useLibraryProgressScreen(isAuthenticated);
  const markCompleted = useProgressStore((s) => s.actions.markCompleted);

  const handleItemPress = useCallback(
    (slug: string) => {
      onNavigateToListing?.(slug);
    },
    [onNavigateToListing],
  );

  const isLoading = isFetching && items.length === 0;

  if (isLoading) {
    return (
      <List>
        <LibraryItemRowSkeleton count={5} />
      </List>
    );
  }

  if (items.length === 0) {
    return (
      <ScreenView center>
        <EmptyState
          message={t("library.emptyProgress", "No lectures in progress.")}
          variant="empty"
        />
      </ScreenView>
    );
  }

  return (
    <List>
      {items.map((item, index) => (
        <LibraryItemRow
          key={item.id}
          item={item}
          variant="progress"
          testID={`library-progress-row-${item.id}`}
          onPress={() => handleItemPress(item.listingSlug)}
          hideBorder={index === items.length - 1}
          actions={[{ id: "complete", title: t("library.markAsCompleted", "Mark as Completed") }]}
          onAction={() => markCompleted(item.listingId)}
        />
      ))}
    </List>
  );
}

function SavedTabContent({
  onNavigateToListing,
}: {
  onNavigateToListing?: (slug: string) => void;
}) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { items, isFetching } = useLibrarySavedScreen(isAuthenticated);

  const handleItemPress = useCallback(
    (slug: string) => {
      onNavigateToListing?.(slug);
    },
    [onNavigateToListing],
  );

  const handleRemove = useCallback((listingId: string, listingSlug: string) => {
    markUnsaved(listingId, listingSlug);
  }, []);

  const isLoading = isFetching && items.length === 0;

  if (isLoading) {
    return (
      <List>
        <LibraryItemRowSkeleton count={5} />
      </List>
    );
  }

  if (items.length === 0) {
    return (
      <ScreenView center>
        <EmptyState
          message={t(
            "library.emptySaved",
            "No saved lectures yet. Save lectures to listen to later.",
          )}
          variant="empty"
        />
      </ScreenView>
    );
  }

  return (
    <List>
      {items.map((item, index) => (
        <LibraryItemRow
          key={item.id}
          item={item}
          variant="saved"
          testID={`library-saved-row-${item.id}`}
          onPress={() => handleItemPress(item.listingSlug)}
          hideBorder={index === items.length - 1}
          actions={[
            {
              id: "remove",
              title: t("library.removeFromSaved", "Remove from Saved"),
              attributes: { destructive: true },
            },
          ]}
          onAction={() => handleRemove(item.listingId, item.listingSlug)}
        />
      ))}
    </List>
  );
}

function CompletedTabContent({
  onNavigateToListing,
}: {
  onNavigateToListing?: (slug: string) => void;
}) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { items, isFetching } = useLibraryCompletedScreen(isAuthenticated);

  const handleItemPress = useCallback(
    (slug: string) => {
      onNavigateToListing?.(slug);
    },
    [onNavigateToListing],
  );

  const isLoading = isFetching && items.length === 0;

  if (isLoading) {
    return (
      <List>
        <LibraryItemRowSkeleton count={5} />
      </List>
    );
  }

  if (items.length === 0) {
    return (
      <ScreenView center>
        <EmptyState
          message={t("library.emptyCompleted", "No completed lectures yet. Keep listening!")}
          variant="empty"
        />
      </ScreenView>
    );
  }

  return (
    <List>
      {items.map((item, index) => (
        <LibraryItemRow
          key={item.id}
          item={item}
          variant="completed"
          testID={`library-completed-row-${item.id}`}
          onPress={() => handleItemPress(item.listingSlug)}
          hideBorder={index === items.length - 1}
        />
      ))}
    </List>
  );
}

const styles = StyleSheet.create({
  pillsContainer: {
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  content: {
    paddingBottom: 40,
  },
});
