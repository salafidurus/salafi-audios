import { Stack } from "expo-router";

import { useTranslation } from "@/core/i18n/use-translation";
import { SearchScreen } from "@/features/search";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

/**
 * Provides the pushed global Search route composition.
 */
/** Delegates search presentation to the feature layer while retaining shared listing navigation. */
export default function SearchRoute() {
  const { t } = useTranslation();
  const { navigateToListing } = useListingNavigation();

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: t("search.title", "Search") }} />
      <SearchScreen onNavigateToListing={navigateToListing} />
    </>
  );
}
