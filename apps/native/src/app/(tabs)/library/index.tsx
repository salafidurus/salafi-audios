import { LibraryScreen } from "@/features/library/screens/library.screen";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

export default function LibraryIndexRoute() {
  const { navigateToListing } = useListingNavigation();

  return <LibraryScreen onNavigateToListing={navigateToListing} />;
}
