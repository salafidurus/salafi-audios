import { useRouter } from "expo-router";
import { useAuth } from "@sd/core-auth";
import { AccountMobileNativeScreen } from "@sd/feature-account";
import { AuthRequiredStateMobileNative } from "@sd/shared";

export default function AccountProfile() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <AuthRequiredStateMobileNative
        title="Sign in to access your account"
        description="Manage your profile, preferences, and account details after signing in."
        onPress={() => router.push("/sign-in")}
      />
    );
  }

  return <AccountMobileNativeScreen />;
}
