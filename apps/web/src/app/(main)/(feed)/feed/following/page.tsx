"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@sd/feature-auth";
import { FeedResponsiveScreen } from "@sd/feature-feed";
import { AuthRequiredStateResponsive } from "@sd/shared";
import { routes } from "@sd/core-contracts";

export default function FeedFollowingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <AuthRequiredStateResponsive
        title="Sign in to see content from scholars you follow"
        description="Follow your favourite scholars to get personalised content in your feed."
        onPress={() => router.push(routes.signIn)}
      />
    );
  }

  return <FeedResponsiveScreen />;
}
