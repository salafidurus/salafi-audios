import { routes } from "@sd/core-contracts";
import { type Href, useRouter } from "expo-router";

import { ExploreScreen } from "@/features/explore/screens/explore-screen";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

export default function ExploreIndexRoute() {
  const router = useRouter();
  const { navigateToListing } = useListingNavigation();

  return (
    <ExploreScreen
      onNavigateToListing={navigateToListing}
      onNavigateToScholar={(slug) => router.push(routes.scholars.detail(slug) as Href)}
    />
  );
}
