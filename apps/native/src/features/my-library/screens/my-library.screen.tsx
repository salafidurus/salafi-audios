import { useProgressStore } from "@sd/domain-audio";
import { markUnsaved, useMyLibrarySections, type MyLibrarySection } from "@sd/domain-content";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { MyLibraryItemRow } from "@/features/my-library/components/my-library-item-row/my-library-item-row";
import { RootScreenHeader } from "@/features/navigation";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { NativeSegmentedControl, ScreenView } from "@/shared/ui";

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

  if (isAuthLoading || (section.isFetching && section.items.length === 0)) {
    return (
      <ScreenView center>
        <RootScreenHeader title={t("myLibrary.title", "My Library")} />
        <EmptyState
          message={t("myLibrary.loadingSection", "Loading {{section}}…", {
            section: sectionLabel,
          })}
          variant="loading"
        />
      </ScreenView>
    );
  }

  if (section.error && section.items.length === 0) {
    return (
      <ScreenView center>
        <RootScreenHeader title={t("myLibrary.title", "My Library")} />
        <EmptyState
          message={t("myLibrary.error", "My Library could not be loaded.")}
          variant="error"
          onRetry={() => void section.refetch?.()}
          retryLabel={t("serverError.retry", "Try Again")}
        />
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <RootScreenHeader title={t("myLibrary.title", "My Library")} />
      <View
        style={styles.selector}
        accessibilityLabel={t("myLibrary.selectorLabel", "My Library sections")}
      >
        <NativeSegmentedControl
          values={labels}
          value={sectionLabel}
          onValueChange={(label) => {
            const index = labels.indexOf(label);
            if (index >= 0) setSelectedSection(SECTIONS[index]!);
          }}
          testID="my-library-section-selector"
        />
      </View>
      {section.items.length === 0 ? (
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
  selector: {
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingBottom: theme.spacing.scale.sm,
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
