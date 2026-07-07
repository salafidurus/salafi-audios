import { type Href, useRouter } from "expo-router";
import { routes } from "@sd/core-contracts";
import { ScholarListScreen } from "@/features/listing/screens/scholar-list/scholar-list.screen";

export default function ScholarsIndexRoute() {
  const router = useRouter();

  return (
    <ScholarListScreen
      onSelectScholar={(slug: string) => {
        const path = routes.scholars.detail(slug);
        router.push(path as Href);
      }}
    />
  );
}
