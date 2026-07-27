import { routes } from "@sd/core-contracts";
import { type Href, useRouter } from "expo-router";

import { FeedRecentScreen } from "@/features/explore/screens/explore-recent.screen";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

export default function ExploreRecent() {
  const router = useRouter();
  const { navigateToListing } = useListingNavigation();

  return (
    <FeedRecentScreen
      onNavigateToListing={navigateToListing}
      onNavigateToScholar={(slug) => router.push(routes.scholars.detail(slug) as Href)}
    />
  );
}
