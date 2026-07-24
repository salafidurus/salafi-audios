import type { ErrorBoundaryProps, Href } from "expo-router";
import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { routes } from "@sd/core-contracts";
import { FeedRecentScreen } from "@/features/explore/screens/explore-recent.screen";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

export function ErrorBoundary({ error: _error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Something went wrong</Text>
      <Pressable onPress={retry}>
        <Text>Try again</Text>
      </Pressable>
    </View>
  );
}

export default function ExploreIndexRoute() {
  const router = useRouter();
  const { navigateToListing } = useListingNavigation();

  return (
    <FeedRecentScreen
      onNavigateToListing={navigateToListing}
      onNavigateToScholar={(slug) => router.push(routes.scholars.detail(slug) as Href)}
    />
  );
}
