import { useProgressStore } from "@sd/domain-audio";
import { markUnsaved, useMyLibrarySections, type MyLibrarySection } from "@sd/domain-content";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { MyLibraryItemRow } from "@/features/my-library/components/my-library-item-row/my-library-item-row";
import { RootScreenHeader } from "@/features/navigation";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { AppText, ScreenView } from "@/shared/ui";

/**
 * Supplies optional listing navigation while the root owns section selection
 * locally; omitting it keeps the screen usable in isolated navigation tests.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the public prop contract is documented above.
export type MyLibraryScreenProps = {
  onNavigateToListing?: (slug: string) => void;
};

const SECTIONS: MyLibrarySection[] = ["started", "saved", "completed"];

function sectionEmptyKey(section: MyLibrarySection) {
  return section === "started"
    ? "myLibrary.emptyProgress"
    : `myLibrary.empty${section[0]!.toUpperCase()}${section.slice(1)}`;
}

function sectionFallback(section: MyLibrarySection) {
  if (section === "started") return "Started";
  return section[0]!.toUpperCase() + section.slice(1);
}

function getActions(section: MyLibrarySection, t: ReturnType<typeof useTranslation>["t"]) {
  if (section === "started") {
    return [{ id: "complete", title: t("myLibrary.markAsCompleted", "Mark as Completed") }];
  }
  if (section === "saved") {
    return [
      {
        id: "remove",
        title: t("myLibrary.removeFromSaved", "Remove from Saved"),
        attributes: { destructive: true },
      },
    ];
  }
  return undefined;
}

type MyLibrarySectionTabsProps = {
  labels: string[];
  selectedSection: MyLibrarySection;
  onSelect: (section: MyLibrarySection) => void;
};

/** Presents the three library views as content tabs instead of a form control. */
function MyLibrarySectionTabs({ labels, selectedSection, onSelect }: MyLibrarySectionTabsProps) {
  const { theme } = useUnistyles();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabsContent}
      style={styles.tabs}
      accessibilityRole="tablist"
      testID="my-library-section-selector"
    >
      {SECTIONS.map((section, index) => {
        const selected = section === selectedSection;
        return (
          <Pressable
            key={section}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={labels[index]}
            onPress={() => onSelect(section)}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
            testID={`my-library-section-tab-${section}`}
          >
            <AppText
              variant="bodyMd"
              colorRole={selected ? "primary" : "subtle"}
              style={selected ? styles.tabLabelSelected : styles.tabLabel}
            >
              {labels[index]}
            </AppText>
            {selected ? (
              <View
                style={[styles.tabIndicator, { backgroundColor: theme.colors.action.primary }]}
              />
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/**
 * Renders one My Library root with internal Started, Saved, and Completed
 * selection. Selection is presentation state and never becomes a route.
 */
// eslint-disable-next-line complexity -- this root deliberately composes three observable states.
export function MyLibraryScreen({ onNavigateToListing }: MyLibraryScreenProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { t } = useTranslation();
  const [selectedSection, setSelectedSection] = useState<MyLibrarySection>("started");
  const sections = useMyLibrarySections(isAuthenticated, true);
  const section = sections[selectedSection];
  const markCompleted = useProgressStore((state) => state.actions.markCompleted);

  const labels = useMemo(
    () => SECTIONS.map((value) => t(`myLibrary.${value}`, sectionFallback(value))),
    [t],
  );
  const handleItemPress = useCallback(
    (slug: string) => onNavigateToListing?.(slug),
    [onNavigateToListing],
  );
  const handleAction = useCallback(
    (action: string, listingId: string, listingSlug: string) => {
      if (action === "complete") markCompleted(listingId);
      if (action === "remove") markUnsaved(listingId, listingSlug);
    },
    [markCompleted],
  );

  const sectionLabel = t(`myLibrary.${selectedSection}`, sectionFallback(selectedSection));
  const isLoading = isAuthLoading || (section.isFetching && section.items.length === 0);

  return (
    <ScreenView>
      <RootScreenHeader title={t("myLibrary.title", "My Library")} />
      {!isAuthLoading ? (
        <MyLibrarySectionTabs
          labels={labels}
          selectedSection={selectedSection}
          onSelect={setSelectedSection}
        />
      ) : null}
      {isLoading ? (
        <View style={styles.status}>
          <EmptyState
            message={t("myLibrary.loadingSection", "Loading {{section}}…", {
              section: sectionLabel,
            })}
            variant="loading"
          />
        </View>
      ) : section.error && section.items.length === 0 ? (
        <View style={styles.status}>
          <EmptyState
            message={t("myLibrary.error", "My Library could not be loaded.")}
            variant="error"
            onRetry={() => void section.refetch?.()}
            retryLabel={t("serverError.retry", "Try Again")}
          />
        </View>
      ) : section.items.length === 0 ? (
        <View style={styles.status}>
          <EmptyState
            message={t(sectionEmptyKey(selectedSection), "Nothing here yet.")}
            variant="empty"
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {section.items.map((item) => (
            <MyLibraryItemRow
              key={item.id}
              item={item}
              variant={selectedSection === "started" ? "progress" : selectedSection}
              testID={`my-library-${selectedSection}-row-${item.id}`}
              onPress={() => handleItemPress(item.listingSlug)}
              actions={getActions(selectedSection, t)}
              onAction={(action) => handleAction(action, item.listingId, item.listingSlug)}
            />
          ))}
        </ScrollView>
      )}
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  tabs: {
    marginHorizontal: theme.spacing.layout.pageX,
    marginBottom: theme.spacing.scale.sm,
    flexGrow: 0,
    flexShrink: 0,
    height: 56,
    borderBottomWidth: theme.border.width.default,
    borderBottomColor: theme.colors.border.default,
  },
  tabsContent: {
    width: "100%",
  },
  tab: {
    minHeight: 48,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.scale.md,
    position: "relative",
  },
  tabPressed: {
    opacity: 0.7,
  },
  tabLabel: {
    textAlign: "center",
  },
  tabLabelSelected: {
    fontWeight: "600",
    textAlign: "center",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: theme.spacing.scale.sm,
    right: theme.spacing.scale.sm,
    height: 2,
    borderRadius: theme.radius.scale.sm,
  },
  status: {
    flex: 1,
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingBottom: theme.spacing.scale["2xl"],
  },
}));
