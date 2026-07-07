// react-doctor-disable-next-line react-doctor/nextjs-missing-metadata
"use client";

import { useAuth } from "@/core/auth";
import { FeedFollowingScreen } from "@/features/explore/screens/explore-following.screen";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";

export default function FeedFollowingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <AuthRequiredState
        title="Sign in to see content from scholars you follow"
        description="Follow your favourite scholars to get personalised content in your feed."
      />
    );
  }

  return <FeedFollowingScreen />;
}
