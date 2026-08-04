import { Column, ScrollView } from "@expo/ui";
import { useProgressStore } from "@sd/domain-audio";
import { useLibraryProgressScreen } from "@sd/domain-content";
import React, { useCallback } from "react";
import { useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { LibraryItemRow } from "@/features/library/components/library-item-row/library-item-row";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { List } from "@/shared/components/List";
import { NativeScreenHost } from "@/shared/ui";

export type LibraryScreenProps = {
  onNavigateToListing?: (slug: string) => void;
};

export function LibraryScreen({ onNavigateToListing }: LibraryScreenProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { items, isFetching } = useLibraryProgressScreen(isAuthenticated);
  const markCompleted = useProgressStore((s) => s.actions.markCompleted);

  const handleItemPress = useCallback(
    (slug: string) => {
      onNavigateToListing?.(slug);
    },
    [onNavigateToListing],
  );

  if (isFetching && items.length === 0) {
    return (
      <NativeScreenHost
        testID="library-screen-host"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <EmptyState
          message={t("library.loadingSection", "Loading {{section}}…", {
            section: t("library.inProgress", "In Progress"),
          })}
          variant="loading"
        />
      </NativeScreenHost>
    );
  }

  if (items.length === 0) {
    return (
      <NativeScreenHost
        testID="library-screen-host"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <EmptyState
          message={t("library.emptyProgress", "No lectures in progress.")}
          variant="empty"
        />
      </NativeScreenHost>
    );
  }

  return (
    <NativeScreenHost testID="library-screen-host">
      <ScrollView showsIndicators={false}>
        <Column
          style={{
            paddingHorizontal: theme.spacing.layout.pageX,
            paddingVertical: theme.spacing.layout.pageY,
            paddingBottom: theme.spacing.scale["2xl"],
          }}
        >
          <List>
            {items.map((item, index) => (
              <LibraryItemRow
                key={item.id}
                item={item}
                variant="progress"
                testID={`library-progress-row-${item.id}`}
                onPress={() => handleItemPress(item.listingSlug)}
                hideBorder={index === items.length - 1}
                actions={[
                  { id: "complete", title: t("library.markAsCompleted", "Mark as Completed") },
                ]}
                onAction={() => markCompleted(item.listingId)}
              />
            ))}
          </List>
        </Column>
      </ScrollView>
    </NativeScreenHost>
  );
}
