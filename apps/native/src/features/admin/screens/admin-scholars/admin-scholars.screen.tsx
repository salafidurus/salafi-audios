import type { ScholarListItemDto } from "@sd/core-contracts";

import { Column } from "@expo/ui";
import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";
import { Stack } from "expo-router";
import { useState } from "react";
import { useUnistyles } from "react-native-unistyles";

import { getThemedSearchBarOptions } from "@/features/navigation/utils/search-bar-options";
import { NativeList, NativeListItem, NativeScreenHost, NativeStateView } from "@/shared/ui";

import { filterScholars } from "./filter-scholars";

type AdminScholarsScreenProps = {
  onNavigateToScholar: (slug: string) => void;
};

export function AdminScholarsScreen({ onNavigateToScholar }: AdminScholarsScreenProps) {
  const { theme } = useUnistyles();
  const { data, isLoading } = useApiQuery<ScholarListItemDto[]>(["scholars", "list"], () =>
    httpClient<ScholarListItemDto[]>({ url: endpoints.scholars.list, method: "GET" }),
  );
  const [searchQuery, setSearchQuery] = useState("");

  const scholars = filterScholars(data ?? [], searchQuery);

  const headerSearchOptions = {
    headerSearchBarOptions: {
      placeholder: "Search scholars...",
      onChangeText: (event: any) => setSearchQuery(event.nativeEvent.text),
      onCancelButtonPress: () => setSearchQuery(""),
      ...getThemedSearchBarOptions(theme),
    },
  };

  return (
    <NativeScreenHost testID="admin-scholars-host">
      <Stack.Screen options={headerSearchOptions} />
      <Column
        spacing={theme.spacing.component.gapLg}
        style={{
          padding: theme.spacing.layout.pageX,
        }}
      >
        {isLoading ? (
          <NativeStateView kind="loading" title="Loading…" />
        ) : scholars.length === 0 ? (
          <NativeStateView kind="empty" title="No scholars found." />
        ) : (
          <NativeList testID="admin-scholars-list">
            {scholars.map((item) => (
              <NativeListItem
                key={item.id}
                onPress={() => onNavigateToScholar(item.slug)}
                title={item.name}
                supportingText={`@${item.slug}`}
                testID={`admin-scholar-row-${item.id}`}
              />
            ))}
          </NativeList>
        )}
      </Column>
    </NativeScreenHost>
  );
}
