/** Provides the cross-root native search palette and its catalog result navigation boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- module responsibility is documented above.
import { getLocalizedName } from "@sd/core-i18n";
import { useInfiniteScholarsList } from "@sd/domain-content";
import { useSearchCatalog, useTopicsList } from "@sd/domain-search";
import { useRouter } from "expo-router";
import React, { createContext, useContext, useMemo, useState } from "react";
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

import { SearchPaletteSheet } from "./SearchPaletteSheet";

type PaletteResult = {
  id: string;
  label: string;
  type: "topic" | "scholar" | "listing";
  /** Canonical slug used by the result's destination route. */
  slug: string;
  metadata?: string;
};

type SearchPaletteContextValue = { open: () => void };
const SearchPaletteContext = createContext<SearchPaletteContextValue | null>(null);

/** Returns the navigation action used to open the shared palette. */
export function useSearchPalette() {
  const context = useContext(SearchPaletteContext);
  if (!context) {
    throw new Error("useSearchPalette must be used inside SearchPaletteProvider");
  }
  return context;
}

function matches(value: string, query: string) {
  return value.toLocaleLowerCase().includes(query.toLocaleLowerCase());
}

/** Builds the bounded, query-matched result list shown by the palette. */
// oxlint-disable-next-line complexity -- result groups are intentionally combined at one public seam.
export function buildPaletteResults(
  query: string,
  topics: ReturnType<typeof useTopicsList>["data"],
  scholarPages: ReturnType<typeof useInfiniteScholarsList>["data"],
  listingData: ReturnType<typeof useSearchCatalog>["data"],
  language: string,
): PaletteResult[] {
  if (!query) return [];

  const topicResults = (topics ?? []).flatMap((topic) => {
    const label = getLocalizedName(topic.name, language);
    return matches(label, query)
      ? [{ id: `topic-${topic.id}`, label, type: "topic" as const, slug: topic.slug }]
      : [];
  });
  const scholarResults = (scholarPages?.pages.flatMap((page) => page.items) ?? []).flatMap(
    (scholar) =>
      matches(scholar.name, query)
        ? [
            {
              id: `scholar-${scholar.id}`,
              label: scholar.name,
              type: "scholar" as const,
              slug: scholar.slug,
            },
          ]
        : [],
  );
  const listings = [
    ...(listingData?.collections ?? []),
    ...(listingData?.series ?? []),
    ...(listingData?.singles ?? []),
  ];
  const listingResults = listings.map((listing) => ({
    id: `listing-${listing.id}`,
    label: listing.title,
    type: "listing" as const,
    slug: listing.slug,
    metadata: listing.scholarName,
  }));

  return [...topicResults, ...scholarResults, ...listingResults].slice(0, 8);
}

/** Owns modal visibility, lazy catalog queries, and result navigation for root screens. */
// oxlint-disable-next-line complexity -- this is the single orchestration boundary for the palette lifecycle.
export function SearchPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
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
  const { data: scholarPages, isLoading: isScholarsLoading } = useInfiniteScholarsList({
    enabled: isOpen,
  });

  const results = useMemo(
    () => buildPaletteResults(normalizedQuery, topics, scholarPages, listingData, i18n.language),
    [i18n.language, listingData, normalizedQuery, scholarPages, topics],
  );

  const close = () => {
    setIsOpen(false);
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
  const contextValue = useMemo(() => ({ open: () => setIsOpen(true) }), []);

  return (
    <SearchPaletteContext.Provider value={contextValue}>
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
            {isLoading ? (
              <ActivityIndicator color={theme.colors.action.primary} />
            ) : normalizedQuery && results.length === 0 ? (
              <Text style={[styles.message, { color: theme.colors.content.muted }]}>
                No catalog results
              </Text>
            ) : !normalizedQuery ? (
              <Text style={[styles.message, { color: theme.colors.content.muted }]}>
                Type to search public catalog content
              </Text>
            ) : (
              results.map((result) => (
                <Pressable
                  accessibilityRole="button"
                  key={result.id}
                  onPress={() => select(result)}
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
                      <Text
                        numberOfLines={1}
                        style={[styles.metadata, { color: theme.colors.content.muted }]}
                      >
                        {result.metadata}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[styles.type, { color: theme.colors.content.muted }]}>
                    {result.type}
                  </Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SearchPaletteSheet>
    </SearchPaletteContext.Provider>
  );
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
