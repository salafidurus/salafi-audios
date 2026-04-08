import { useRouter } from "expo-router";
import { useAuth } from "@sd/core-auth";
import { LibraryCompletedMobileNativeScreen } from "../../../features/library/screens/library-completed.screen";
import { AuthRequiredStateMobileNative } from "../../../shared/components/AuthRequiredState/AuthRequiredState";
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
