import { useRouter } from "expo-router";
import { useAuth } from "@/core/auth";
import { LibrarySavedScreen } from "@/features/library/screens/library-saved.screen";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { routes } from "@sd/core-contracts";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

export default function LibrarySaved() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { navigateToListing } = useListingNavigation();

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

  return <LibrarySavedScreen onNavigateToListing={navigateToListing} />;
}
