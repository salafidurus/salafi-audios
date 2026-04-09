import { useRouter } from "expo-router";
import { ScholarListMobileNativeScreen } from "../../../features/scholar/screens/scholar-list/scholar-list.screen";

export default function ScholarsScreen() {
  const router = useRouter();

  return (
    <ScholarListMobileNativeScreen
      onSelectScholar={(slug) => router.push({ pathname: "/scholar/[slug]", params: { slug } })}
    />
  );
}
