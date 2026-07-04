"use client";

import { useAuth } from "@/core/auth";
import { AccountProfileScreen } from "@/features/account/screens/account-profile.screen";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";

export function AccountProfilePageClient() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <AuthRequiredState
        title="Sign in to edit your profile"
        description="Create an account to manage your profile settings."
      />
    );
  }

  return <AccountProfileScreen />;
}
