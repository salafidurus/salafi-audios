import { useRouter } from "expo-router";
import { useAuth } from "@sd/core-auth";
import { FeedFollowingMobileNativeScreen } from "@sd/feature-feed";
import { AuthRequiredStateMobileNative } from "@sd/shared";
import { routes } from "@sd/core-contracts";

export default function FeedFollowing() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <AuthRequiredStateMobileNative
        title="Sign in to see content from scholars you follow"
        description="Follow your favourite scholars to get personalised content in your feed."
        onPress={() => router.push(routes.signIn)}
      />
    );
  }

  return <FeedFollowingMobileNativeScreen />;
}
