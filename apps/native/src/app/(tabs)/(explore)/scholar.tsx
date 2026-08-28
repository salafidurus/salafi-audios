import { routes } from "@sd/core-contracts";
import { useRouter } from "expo-router";

import { ExploreScholarScreen } from "@/features/explore/screens/explore-scholar.screen";

/** Defines the Expo Router entrypoint for the native (tabs)/(explore)/scholar route and delegates behavior to the feature layer. */
/** Renders the native explore scholar route surface and coordinates its user-facing state. */
export default function ExploreScholarRoute() {
  const router = useRouter();

  return (
    <ExploreScholarScreen
      onNavigateToScholar={(slug: string) => {
        const path = routes.scholars.detail(slug);
        router.push(path);
      }}
    />
  );
}
