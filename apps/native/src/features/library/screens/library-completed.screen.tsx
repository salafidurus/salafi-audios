import { Column } from "@expo/ui";
import { pickContentField } from "@sd/core-i18n";
import { useLibraryCompletedScreen } from "@sd/domain-content";
import { useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { NativeList, NativeListItem, NativeScreenHost, NativeStateView } from "@/shared/ui";

export type LibraryCompletedScreenProps = {
  onNavigateToListing?: (slug: string) => void;
};

export function LibraryCompletedScreen({ onNavigateToListing }: LibraryCompletedScreenProps) {
  const { theme } = useUnistyles();
  const { isAuthenticated } = useAuth();
  const { items, isFetching } = useLibraryCompletedScreen(isAuthenticated);
  const { t } = useTranslation();
  const showOriginal = useShowOriginalContent();

  return (
    <NativeScreenHost testID="library-completed-host">
      <Column
        spacing={theme.spacing.component.gapLg}
        style={{ width: "100%", padding: theme.spacing.layout.pageX }}
      >
        {isFetching && items.length === 0 ? (
          <NativeStateView kind="loading" title={t("common.loading", "Loading...")} />
        ) : items.length === 0 ? (
          <NativeStateView
            kind="empty"
            title={t("library.emptyCompleted", "No completed lectures yet. Keep listening!")}
          />
        ) : (
          <NativeList testID="library-completed-list">
            {items.map((item) => {
              const title = pickContentField(
                item.listingTitle,
                item.originalListingTitle,
                showOriginal,
              );
              const details = [
                item.scholarName,
                item.seriesTitle,
                item.durationSeconds
                  ? t("lecture.minutes", "{{count}} min", {
                      count: Math.round(item.durationSeconds / 60),
                    })
                  : undefined,
                item.completedAt
                  ? t("library.completedOn", "Completed {{date}}", {
                      date: new Date(item.completedAt).toLocaleDateString(),
                    })
                  : undefined,
              ].filter(Boolean);

              return (
                <NativeListItem
                  key={item.id}
                  leadingIcon="success"
                  onPress={() => onNavigateToListing?.(item.listingSlug)}
                  supportingText={details.join(" · ")}
                  testID={`library-completed-row-${item.id}`}
                  title={title}
                />
              );
            })}
          </NativeList>
        )}
      </Column>
    </NativeScreenHost>
  );
}
