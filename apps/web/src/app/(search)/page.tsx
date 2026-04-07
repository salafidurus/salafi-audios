"use client";

import { useRouter } from "next/navigation";
import { SearchHomeResponsiveScreen } from "@sd/feature-search";
import { routes } from "@sd/core-contracts";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 min-h-full flex-col">
      <SearchHomeResponsiveScreen
        onOpenSearch={() => router.push(routes.search)}
        onSelectCategory={(searchKey) =>
          router.push(`${routes.search}?searchKey=${encodeURIComponent(searchKey)}`)
        }
      />
    </main>
  );
}
