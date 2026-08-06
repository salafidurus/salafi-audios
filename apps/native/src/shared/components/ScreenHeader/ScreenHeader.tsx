import { ChevronLeft, Search, X } from "lucide-react-native";
import React from "react";
import { Pressable, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { AppText } from "../AppText/AppText";

export type ScreenHeaderProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
};

export function ScreenHeader({
  title,
  showBack = false,
  onBack,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search recent audios...",
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.topRow}>
        {showBack && onBack ? (
          <Pressable
            testID="header-back-button"
            onPress={onBack}
            style={styles.backButton}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ChevronLeft size={24} color={theme.colors.content.strong} />
          </Pressable>
        ) : null}
        <AppText variant="displayLg" color="strong" style={styles.titleText}>
          {title}
        </AppText>
      </View>

      {onSearchChange !== undefined ? (
        <View style={styles.searchBarBox}>
          <View style={styles.searchIconWrapper}>
            <Search size={18} color={theme.colors.content.subtle} />
          </View>
          <TextInput
            value={searchQuery ?? ""}
            onChangeText={onSearchChange}
            placeholder={searchPlaceholder}
            placeholderTextColor={theme.colors.content.muted}
            style={styles.searchInput}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
          {searchQuery && searchQuery.length > 0 ? (
            <Pressable onPress={() => onSearchChange("")} hitSlop={8}>
              <X size={18} color={theme.colors.content.subtle} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface.canvas,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    marginRight: 8,
    padding: 2,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "700",
  },
  searchBarBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 46,
    marginTop: 4,
  },
  searchIconWrapper: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.content.strong,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
}));
