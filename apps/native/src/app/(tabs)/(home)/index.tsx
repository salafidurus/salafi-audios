import { useRouter } from "expo-router";

import { HomeScreen } from "@/features/home";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

/** Provides the native Home entrypoint for the listener-facing navigation shell. */
/**
 * Defines the public Home route and delegates its study-surface behavior to the feature layer.
 * Navigation callbacks stay here so the feature screen remains independent of Expo Router.
 */
export default function HomeRoute() {
  const router = useRouter();
  const { navigateToListing } = useListingNavigation();

  return (
    <HomeScreen
      onNavigateToListing={navigateToListing}
      onNavigateToScholar={(slug) => router.push(`/scholars/${slug}`)}
    />
  );
}
