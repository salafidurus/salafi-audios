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
      />
    </main>
  );
}
