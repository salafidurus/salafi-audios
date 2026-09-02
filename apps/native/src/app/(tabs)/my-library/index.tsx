import { MyLibraryScreen } from "@/features/my-library/screens/my-library.screen";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

/** Defines the Expo Router entrypoint for the native (tabs)/my-library route and delegates behavior to the feature layer. */
/** Renders the native my library index route surface and coordinates its user-facing state. */
export default function MyLibraryIndexRoute() {
  const { navigateToListing } = useListingNavigation();

  return <MyLibraryScreen onNavigateToListing={navigateToListing} />;
}
