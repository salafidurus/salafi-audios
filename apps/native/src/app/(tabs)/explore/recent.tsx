import { type Href, useRouter } from "expo-router";
import { routes } from "@sd/core-contracts";
import { FeedRecentScreen } from "@/features/explore/screens/explore-recent.screen";

export default function ExploreRecent() {
  const router = useRouter();

  return (
    <FeedRecentScreen
      onNavigateToLecture={(id) => router.push(routes.lectures.detail(id) as Href)}
      onNavigateToScholar={(slug) => router.push(routes.scholars.detail(slug) as Href)}
    />
  );
}
