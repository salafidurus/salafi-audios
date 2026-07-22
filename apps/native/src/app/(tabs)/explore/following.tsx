import { type Href, useRouter } from "expo-router";
import { FeedFollowingScreen } from "@/features/explore/screens/explore-following.screen";
import { routes } from "@sd/core-contracts";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

export default function ExploreFollowing() {
  const router = useRouter();
  const { navigateToListing } = useListingNavigation();

  return (
    <FeedFollowingScreen
      onNavigateToListing={navigateToListing}
      onNavigateToScholar={(slug) => router.push(routes.scholars.detail(slug) as Href)}
    />
  );
}
