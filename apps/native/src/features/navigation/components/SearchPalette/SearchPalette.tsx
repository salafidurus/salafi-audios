/** Provides the cross-root native search palette and its catalog result navigation boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- module responsibility is documented above.
import { useScholarSearch } from "@sd/domain-content";
import { useSearchCatalog, useTopicsList } from "@sd/domain-search";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";

import { buildPaletteResults, type PaletteResult } from "./search-palette-results";
import { useSearchPaletteStore } from "./search-palette.store";
import { SearchPaletteSheet } from "./SearchPaletteSheet";

/**
 * Owns lazy catalog queries and result navigation for the app-global palette.
 * Visibility is held in Zustand so header actions do not depend on this provider's module.
 */
// oxlint-disable complexity -- this is the single orchestration boundary for the palette lifecycle.
// oxlint-disable-next-line anti-slop/require-tsdoc -- the provider contract is documented above.
export function SearchPaletteProvider({ children }: { children: React.ReactNode }) {
  const isOpen = useSearchPaletteStore((state) => state.isOpen);
  const closePalette = useSearchPaletteStore((state) => state.close);
  const [query, setQuery] = useState("");
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const normalizedQuery = query.trim();
  const { theme } = useUnistyles();

  const { data: listingData, isLoading: isListingsLoading } = useSearchCatalog(
    { q: normalizedQuery, limit: 8 },
    { enabled: isOpen && normalizedQuery.length > 0 },
  );
  const { data: topics = [], isLoading: isTopicsLoading } = useTopicsList({ enabled: isOpen });
  const { data: scholarData, isLoading: isScholarsLoading } = useScholarSearch(normalizedQuery, {
    enabled: isOpen && normalizedQuery.length > 0,
  });

  const results = useMemo(
    () =>
      buildPaletteResults(
        normalizedQuery,
        topics,
        scholarData?.scholars,
        listingData,
        i18n.language,
      ),
    [i18n.language, listingData, normalizedQuery, scholarData?.scholars, topics],
  );

  const close = () => {
    closePalette();
    setQuery("");
  };
  const select = (result: PaletteResult) => {
    close();
    if (result.type === "listing") router.push(`/listings/${result.slug}`);
    else if (result.type === "scholar") router.push(`/scholars/${result.slug}`);
    else router.push({ pathname: "/explore", params: { topic: result.slug } });
  };
  const isLoading =
    normalizedQuery.length > 0 && (isListingsLoading || isTopicsLoading || isScholarsLoading);
  return (
    <>
      {children}
      <SearchPaletteSheet
        isPresented={isOpen}
        onDismiss={close}
        color={theme.colors.surface.elevated}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={[styles.sheet, { backgroundColor: theme.colors.surface.elevated }]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.content.strong }]}>
              {t("navigation.searchCatalog", "Search catalog")}
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close search" onPress={close}>
              <Text style={[styles.close, { color: theme.colors.content.muted }]}>×</Text>
            </Pressable>
          </View>
          <Text style={[styles.description, { color: theme.colors.content.muted }]}>
            {t("navigation.searchCatalogDescription", "Find topics, scholars, and listings.")}
          </Text>
          <TextInput
            autoFocus
            accessibilityLabel={t("navigation.searchCatalog", "Search catalog")}
            placeholder={t(
              "navigation.searchCatalogPlaceholder",
              "Search topics, scholars, or listings",
            )}
            placeholderTextColor={theme.colors.content.muted}
            style={[
              styles.input,
              {
                color: theme.colors.content.strong,
                borderColor: theme.colors.border.subtle,
                backgroundColor: theme.colors.surface.default,
              },
            ]}
            testID="native-search-palette-input"
            value={query}
            onChangeText={setQuery}
          />
          <ScrollView keyboardShouldPersistTaps="handled" style={styles.results}>
            <PaletteResults
              isLoading={isLoading}
              normalizedQuery={normalizedQuery}
              onSelect={select}
              results={results}
              theme={theme}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SearchPaletteSheet>
    </>
  );
}
// oxlint-enable complexity

function PaletteResults({
  isLoading,
  normalizedQuery,
  onSelect,
  results,
  theme,
}: {
  isLoading: boolean;
  normalizedQuery: string;
  onSelect: (result: PaletteResult) => void;
  results: PaletteResult[];
  theme: ReturnType<typeof useUnistyles>["theme"];
}) {
  if (isLoading) return <ActivityIndicator color={theme.colors.action.primary} />;
  if (normalizedQuery && results.length === 0) {
    return (
      <Text style={[styles.message, { color: theme.colors.content.muted }]}>
        No catalog results
      </Text>
    );
  }
  if (!normalizedQuery) {
    return (
      <Text style={[styles.message, { color: theme.colors.content.muted }]}>
        Type to search public catalog content
      </Text>
    );
  }
  return results.map((result) => (
    <Pressable
      accessibilityRole="button"
      key={result.id}
      onPress={() => onSelect(result)}
      style={({ pressed }) => [styles.result, pressed && styles.resultPressed]}
    >
      <View style={styles.resultBody}>
        <Text
          numberOfLines={1}
          style={[styles.resultLabel, { color: theme.colors.content.default }]}
        >
          {result.label}
        </Text>
        {result.metadata ? (
          <Text numberOfLines={1} style={[styles.metadata, { color: theme.colors.content.muted }]}>
            {result.metadata}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.type, { color: theme.colors.content.muted }]}>{result.type}</Text>
    </Pressable>
  ));
}

/** Returns the app-global search palette action used by navigation controls. */
export function useSearchPalette() {
  return { open: useSearchPaletteStore((state) => state.open) };
}

const styles = StyleSheet.create((theme) => ({
  sheet: {
    minHeight: 320,
    padding: theme.spacing.scale.lg,
    gap: theme.spacing.scale.sm,
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 22, fontWeight: "700" },
  close: { fontSize: 30, lineHeight: 30, paddingHorizontal: theme.spacing.scale.xs },
  description: { fontSize: 14 },
  input: {
    minHeight: theme.spacing.scale["4xl"],
    borderWidth: theme.border.width.default,
    borderRadius: theme.radius.component.panel,
    paddingHorizontal: theme.spacing.scale.md,
    fontSize: 16,
  },
  results: { flexGrow: 0 },
  message: { paddingVertical: theme.spacing.scale.lg, textAlign: "center" },
  result: {
    minHeight: theme.spacing.scale["4xl"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.scale.md,
    padding: theme.spacing.scale.md,
    borderRadius: theme.radius.component.panel,
  },
  resultPressed: { backgroundColor: theme.colors.surface.subtle },
  resultBody: { flex: 1, gap: theme.spacing.scale.xs },
  resultLabel: { fontSize: 16 },
  metadata: { fontSize: 13 },
  type: { fontSize: 12, textTransform: "capitalize" },
}));
