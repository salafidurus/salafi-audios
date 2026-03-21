import { useRouter } from "expo-router";
import { useAuth } from "@sd/core-auth";
import { LibraryMobileNativeScreen } from "@sd/feature-library";
import { AuthRequiredStateMobileNative } from "@sd/shared";

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
        onPress={() => router.push("/sign-in")}
      />
    );
  }

  return <LibraryMobileNativeScreen />;
}
