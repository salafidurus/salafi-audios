import { Column, ScrollView } from "@expo/ui";
import { getEmptyStateText, getErrorStateText } from "@sd/core-i18n";
import { useInfiniteScholarsList } from "@sd/domain-content";
import { Stack } from "expo-router";
import { useState } from "react";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { ScholarRow } from "@/features/listing/components/scholar-row/scholar-row";
import { getThemedSearchBarOptions } from "@/features/navigation/utils/search-bar-options";
import { List } from "@/shared/components/List";
import { NativeScreenHost } from "@/shared/ui";

import { ExploreSkeleton } from "../components/explore-skeleton/explore-skeleton";
import {
  ExploreLoadingFooter,
  ExploreStatusView,
} from "../components/explore-status/explore-status";

export type ExploreScholarScreenProps = {
  onNavigateToScholar?: (slug: string) => void;
};

export function ExploreScholarScreen({ onNavigateToScholar }: ExploreScholarScreenProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isFetching, isError, refetch } = useInfiniteScholarsList();

  const allScholars = data?.pages.flatMap((p) => p.items) ?? [];

  const filteredScholars = searchQuery.trim()
    ? allScholars.filter(
        (scholar) =>
          scholar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          scholar.slug.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allScholars;

  const headerSearchOptions = {
    headerSearchBarOptions: {
      placeholder: t("scholarContent.searchScholars", "Search scholars..."),
      onChangeText: (event: any) => setSearchQuery(event.nativeEvent.text),
      onCancelButtonPress: () => setSearchQuery(""),
      ...getThemedSearchBarOptions(theme),
    },
  };

  if (isError && allScholars.length === 0) {
    return (
      <NativeScreenHost style={{ justifyContent: "center", alignItems: "center" }}>
        <Stack.Screen options={headerSearchOptions} />
        <ExploreStatusView
          message={getErrorStateText("feed", t)}
          onRetry={() => refetch()}
          retryLabel={t("feed.retry", "Try Again")}
        />
      </NativeScreenHost>
    );
  }

  if (isFetching && allScholars.length === 0) {
    return (
      <NativeScreenHost testID="explore-scholar-screen-host">
        <Stack.Screen options={headerSearchOptions} />
        <ExploreSkeleton />
      </NativeScreenHost>
    );
  }

  if (filteredScholars.length === 0) {
    return (
      <NativeScreenHost style={{ justifyContent: "center", alignItems: "center" }}>
        <Stack.Screen options={headerSearchOptions} />
        <ExploreStatusView
          message={
            searchQuery
              ? t("scholarContent.searchNoMatch", "No scholars match your search.")
              : getEmptyStateText("feed", t)
          }
        />
      </NativeScreenHost>
    );
  }

  return (
    <NativeScreenHost testID="explore-scholar-screen-host">
      <Stack.Screen options={headerSearchOptions} />
      <ScrollView showsIndicators={false}>
        <Column spacing={theme.spacing.scale.md}>
          <List>
            {filteredScholars.map((scholar, index) => (
              <ScholarRow
                key={scholar.id}
                scholar={scholar}
                onPress={onNavigateToScholar}
                hideBorder={index === filteredScholars.length - 1}
              />
            ))}
          </List>
          {isFetching ? <ExploreLoadingFooter /> : null}
        </Column>
      </ScrollView>
    </NativeScreenHost>
  );
}
