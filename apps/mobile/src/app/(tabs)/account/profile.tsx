import { useRouter } from "expo-router";
import { useAuth } from "../../../core/auth";
import { AccountProfileScreen } from "../../../features/account/screens/account-profile.screen";
import { AuthRequiredState } from "../../../shared/components/AuthRequiredState/AuthRequiredState";
import { routes } from "@sd/core-contracts";

export default function AccountProfile() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <AuthRequiredState
        title="Sign in to access your account"
        description="Manage your profile, preferences, and account details after signing in."
        onPress={() => router.push(routes.signIn)}
      />
    );
  }

  return <AccountProfileScreen />;
}
