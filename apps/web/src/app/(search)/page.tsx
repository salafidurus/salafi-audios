"use client";

import { useRouter } from "next/navigation";
import { SearchHomeResponsiveScreen } from "@sd/feature-search";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 min-h-full flex-col">
      <SearchHomeResponsiveScreen
        onOpenSearch={() => router.push("/search")}
        onSelectCategory={(searchKey) =>
          router.push(`/search?searchKey=${encodeURIComponent(searchKey)}`)
        }
      />
    </main>
  );
}
