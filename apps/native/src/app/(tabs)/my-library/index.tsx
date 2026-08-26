import { MyLibraryScreen } from "@/features/my-library/screens/my-library.screen";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

export default function MyLibraryIndexRoute() {
  const { navigateToListing } = useListingNavigation();

  return <MyLibraryScreen onNavigateToListing={navigateToListing} />;
}
