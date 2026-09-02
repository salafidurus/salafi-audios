import { routes } from "@sd/core-contracts";
import { useRouter } from "expo-router";

import { ExploreScreen } from "@/features/explore/screens/explore-recent.screen";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

/** Defines the Explore root entrypoint for the native discovery shell. */
/** Preserves the mixed discovery feed as the single Explore root surface. */
export default function ExploreRoute() {
  const router = useRouter();
  const { navigateToListing } = useListingNavigation();

  return (
    <ExploreScreen
      onNavigateToListing={navigateToListing}
      onNavigateToScholar={(slug) => router.push(routes.scholars.detail(slug))}
    />
  );
}
