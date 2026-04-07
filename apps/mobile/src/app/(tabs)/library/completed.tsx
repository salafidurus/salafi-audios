import { useRouter } from "expo-router";
import { useAuth } from "@sd/core-auth";
import { LibraryCompletedMobileNativeScreen } from "@sd/feature-library";
import { AuthRequiredStateMobileNative } from "@sd/shared";
import { routes } from "@sd/core-contracts";

export default function LibraryCompleted() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <AuthRequiredStateMobileNative
        title="Sign in to access your library"
        description="Your saved, started, and completed listening lives in your personal library."
        onPress={() => router.push(routes.signIn)}
      />
    );
  }

  return <LibraryCompletedMobileNativeScreen />;
}
