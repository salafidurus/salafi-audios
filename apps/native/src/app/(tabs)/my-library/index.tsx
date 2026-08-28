import { MyLibraryScreen } from "@/features/my-library/screens/my-library.screen";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

/** Provides the native app (tabs) my-library index module responsibility. */
/** Describes the MyLibraryIndexRoute native function contract and behavior. */
export default function MyLibraryIndexRoute() {
  const { navigateToListing } = useListingNavigation();

  return <MyLibraryScreen onNavigateToListing={navigateToListing} />;
}
