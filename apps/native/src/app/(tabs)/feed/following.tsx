import { type Href, useRouter } from "expo-router";
import { useAuth } from "@/core/auth";
import { FeedFollowingScreen } from "@/features/feed/screens/feed-following.screen";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { routes } from "@sd/core-contracts";

export default function FeedFollowing() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <AuthRequiredState
        title="Sign in to see content from scholars you follow"
        description="Follow your favourite scholars to get personalised content in your feed."
        onPress={() => router.push(routes.signIn)}
      />
    );
  }

  return (
    <FeedFollowingScreen
      onNavigateToLecture={(id) => router.push(routes.lectures.detail(id) as Href)}
      onNavigateToScholar={(slug) => router.push(routes.scholars.detail(slug) as Href)}
    />
  );
}
