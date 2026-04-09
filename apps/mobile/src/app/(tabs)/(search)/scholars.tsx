import { useRouter } from "expo-router";
import { ScholarListScreen } from "../../../features/scholar/screens/scholar-list/scholar-list.screen";

export default function ScholarsScreen() {
  const router = useRouter();

  return (
    <ScholarListScreen
      onSelectScholar={(slug) => router.push({ pathname: "/scholar/[slug]", params: { slug } })}
    />
  );
}
