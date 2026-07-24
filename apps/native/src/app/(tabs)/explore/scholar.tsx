import { type Href, useRouter } from "expo-router";
import { routes } from "@sd/core-contracts";
import { ExploreScholarScreen } from "@/features/explore/screens/explore-scholar.screen";

export default function ExploreScholarRoute() {
  const router = useRouter();

  return (
    <ExploreScholarScreen
      onNavigateToScholar={(slug: string) => {
        const path = routes.scholars.detail(slug);
        router.push(path as Href);
      }}
    />
  );
}
