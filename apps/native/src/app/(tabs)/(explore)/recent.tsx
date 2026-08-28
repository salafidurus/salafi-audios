import { routes } from "@sd/core-contracts";
import { useRouter } from "expo-router";

import { ExploreRecentScreen } from "@/features/explore/screens/explore-recent.screen";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

/** Defines the Expo Router entrypoint for the native (tabs)/(explore)/recent route and delegates behavior to the feature layer. */
/** Defines the native explore recent contract used by this module. */
export default function ExploreRecent() {
  const router = useRouter();
  const { navigateToListing } = useListingNavigation();

  return (
    <ExploreRecentScreen
      onNavigateToListing={navigateToListing}
      onNavigateToScholar={(slug) => router.push(routes.scholars.detail(slug))}
    />
  );
}
