import { type Href, useRouter } from "expo-router";
import { FeedFollowingScreen } from "@/features/explore/screens/explore-following.screen";
import { routes } from "@sd/core-contracts";

export default function ExploreFollowing() {
  const router = useRouter();

  return (
    <FeedFollowingScreen
      onNavigateToLecture={(id) => router.push(routes.lectures.detail(id) as Href)}
      onNavigateToScholar={(slug) => router.push(routes.scholars.detail(slug) as Href)}
    />
  );
}
