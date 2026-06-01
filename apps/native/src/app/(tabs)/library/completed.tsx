import { type Href, useRouter } from "expo-router";
import { useAuth } from "@/core/auth";
import { LibraryCompletedScreen } from "@/features/library/screens/library-completed.screen";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { routes } from "@sd/core-contracts";

export default function LibraryCompleted() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <AuthRequiredState
        title="Sign in to access your library"
        description="Your saved, started, and completed listening lives in your personal library."
        onPress={() => router.push(routes.signIn)}
      />
    );
  }

  return (
    <LibraryCompletedScreen
      onNavigateToLecture={(id) => router.push(routes.lectures.detail(id) as Href)}
    />
  );
}
