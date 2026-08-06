import { routes } from "@sd/core-contracts";
import { useRouter } from "expo-router";

import { useAuth } from "@/core/auth";
import { LibraryScreen } from "@/features/library/screens/library.screen";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

export default function LibraryIndexRoute() {
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
        onPress={() =>
          router.push({ pathname: routes.signIn, params: { from: routes.library.index } })
        }
      />
    );
  }

  return <LibraryScreen onNavigateToListing={navigateToListing} />;
}
