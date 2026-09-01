import { routes } from "@sd/core-contracts";
import { useRouter } from "expo-router";

import { ExploreRecentScreen } from "@/features/explore/screens/explore-recent.screen";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

/** Defines the Explore root entrypoint for the native discovery shell. */
/** Preserves the existing discovery projection as the Explore root until later parity slices expand it. */
export default function ExploreRoute() {
  const router = useRouter();
  const { navigateToListing } = useListingNavigation();

  return (
    <ExploreRecentScreen
      onNavigateToListing={navigateToListing}
      onNavigateToScholar={(slug) => router.push(routes.scholars.detail(slug))}
    />
  );
}
