import { routes } from "@sd/core-contracts";
import { useRouter } from "expo-router";

import { useAuth } from "@/core/auth";
import { nativeRoutes } from "@/core/navigation/routes";
import { MyLibraryCompletedScreen } from "@/features/my-library/screens/my-library-completed.screen";
import { AuthRequiredState } from "@/shared/components/AuthRequiredState/AuthRequiredState";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

/** Provides the native app (tabs) my-library completed module responsibility. */
/** Describes the MyLibraryCompleted native function contract and behavior. */
export default function MyLibraryCompleted() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { navigateToListing } = useListingNavigation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <AuthRequiredState
        title="Sign in to access My Library"
        description="Your saved, started, and completed listening lives in your personal myLibrary."
        onPress={() =>
          router.push({
            pathname: routes.signIn,
            params: { from: nativeRoutes.myLibrary.completed },
          })
        }
      />
    );
  }

  return <MyLibraryCompletedScreen onNavigateToListing={navigateToListing} />;
}
