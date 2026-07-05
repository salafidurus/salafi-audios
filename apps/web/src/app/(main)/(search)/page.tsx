// react-doctor-disable-next-line react-doctor/nextjs-missing-metadata
"use client";

import { useRouter } from "next/navigation";
import { SearchHomeScreen } from "@/features/search/screens/search-home/search-home.screen";
import { routes } from "@sd/core-contracts";

export default function HomePage() {
  const { push } = useRouter();

  return (
    <main className="flex flex-1 min-h-full flex-col">
      <SearchHomeScreen
        onOpenSearch={() => push(routes.search)}
        onSelectCategory={(searchKey) =>
          push(`${routes.search}?searchKey=${encodeURIComponent(searchKey)}`)
        }
        onSelectScholar={(slug) => push(routes.scholars.detail(slug))}
        onSelectSuggestion={(id, kind) => {
          if (kind === "collection") {
            push(routes.collections.detail(id));
          } else if (kind === "series") {
            push(routes.series.detail(id));
          } else if (kind === "single") {
            push(routes.lectures.detail(id));
          }
        }}
        onContinueListening={(lectureId) => push(routes.lectures.detail(lectureId))}
      />
    </main>
  );
}
