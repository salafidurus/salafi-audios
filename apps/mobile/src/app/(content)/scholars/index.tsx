import { useRouter } from "expo-router";
import { ScholarListScreen } from "../../../features/scholar/screens/scholar-list/scholar-list.screen";
import { routes } from "@sd/core-contracts";

export default function ScholarsRoute() {
  const router = useRouter();

  return (
    <ScholarListScreen
      onSelectScholar={(slug: string) => {
        const path = routes.scholars.detail(slug);
        router.push(path as any);
      }}
    />
  );
}
