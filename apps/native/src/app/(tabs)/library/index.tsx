import { type Href, useRouter } from "expo-router";
import { routes } from "@sd/core-contracts";
import { LibraryScreen } from "@/features/library/screens/library.screen";

export default function LibraryIndexRoute() {
  const router = useRouter();

  return (
    <LibraryScreen
      onNavigateToLecture={(id: string) => {
        const path = routes.lectures.detail(id);
        router.push(path as Href);
      }}
    />
  );
}
