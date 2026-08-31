import type { ScholarListItemDto } from "@sd/core-contracts";

import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";
import { Stack } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { getThemedSearchBarOptions } from "@/features/navigation/utils/search-bar-options";
import { AppText } from "@/shared/components/AppText/AppText";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { List } from "@/shared/components/List";
import { MarqueeText } from "@/shared/components/MarqueeText";

import { filterScholars } from "./filter-scholars";

/** Provides authenticated native administration workflows and their data boundaries. */
type AdminScholarsScreenProps = {
  onNavigateToScholar: (slug: string) => void;
};

/** Renders the native admin scholars screen surface and coordinates its user-facing state. */
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
    <View style={styles.container}>
      <Stack.Screen options={headerSearchOptions} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <AppText variant="titleLg">Scholars</AppText>
        </View>
        {isLoading ? (
          <EmptyState message="Loading…" variant="loading" />
        ) : scholars.length === 0 ? (
          <EmptyState message="No scholars found." variant="empty" />
        ) : (
          <List>
            {scholars.map((item) => (
              <List.Item key={item.id} onPress={() => onNavigateToScholar(item.slug)}>
                <View style={styles.rowContent}>
                  <MarqueeText text={item.name} variant="bodyMd" style={styles.rowName} />
                  <AppText variant="caption" style={styles.rowSlug}>
                    @{item.slug}
                  </AppText>
                </View>
              </List.Item>
            ))}
          </List>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface.canvas,
  },
  scrollContent: {
    padding: theme.spacing.scale.md,
  },
  header: {
    paddingVertical: theme.spacing.scale.md,
  },
  loadingText: {
    textAlign: "center",
    marginTop: theme.spacing.scale["3xl"],
    color: theme.colors.content.muted,
  },
  rowContent: {
    gap: theme.spacing.scale.xs,
  },
  rowName: {
    fontWeight: "600",
    color: theme.colors.content.strong,
  },
  rowSlug: {
    color: theme.colors.content.muted,
  },
}));
