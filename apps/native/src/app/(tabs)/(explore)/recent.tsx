import { routes } from "@sd/core-contracts";
import { useRouter } from "expo-router";

import { ExploreRecentScreen } from "@/features/explore/screens/explore-recent.screen";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

/** Provides the native app (tabs) (explore) recent module responsibility. */
/** Describes the ExploreRecent native function contract and behavior. */
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
