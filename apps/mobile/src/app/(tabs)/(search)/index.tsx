import type { ErrorBoundaryProps } from "expo-router";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SearchHomeScreen } from "../../../features/search/screens/search-home/search-home.screen";
import * as ScreenViewMod from "../../../shared/components/ScreenView/ScreenView";
import * as QuickBrowseMod from "../../../features/search/components/QuickBrowse/QuickBrowse";
import * as BrowseCardMod from "../../../features/search/components/BrowseCard/BrowseCard";
import * as AppTextMod from "../../../shared/components/AppText/AppText";

// eslint-disable-next-line no-console
console.log("[PROBE search/index] bindings:", {
  SearchHomeScreen: typeof SearchHomeScreen,
  ScreenView: typeof ScreenViewMod.ScreenView,
  QuickBrowse: typeof QuickBrowseMod.QuickBrowse,
  BrowseCard: typeof BrowseCardMod.BrowseCard,
  AppText: typeof AppTextMod.AppText,
  View: typeof View,
  Text: typeof Text,
  Pressable: typeof Pressable,
  ScrollView: typeof ScrollView,
});

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Something went wrong</Text>
      <Pressable onPress={retry}>
        <Text>Try again</Text>
      </Pressable>
    </View>
  );
}

export default function SearchIndex() {
  // BISECT: temporarily render a bare View/Text to see if the crash is inside SearchHomeScreen.
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>SearchIndex bisect OK</Text>
    </View>
  );
}
