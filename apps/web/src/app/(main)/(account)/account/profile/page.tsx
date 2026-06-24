// react-doctor-disable-next-line react-doctor/nextjs-missing-metadata
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/core/auth";
import { AccountProfileScreen } from "@/features/account/screens/account-profile.screen";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { routes } from "@sd/core-contracts";

export default function AccountProfilePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { push } = useRouter();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <AuthRequiredState
        title="Sign in to edit your profile"
        description="Create an account to manage your profile settings."
        onPress={() => push(routes.signIn)}
      />
    );
  }

  return <AccountProfileScreen />;
}
