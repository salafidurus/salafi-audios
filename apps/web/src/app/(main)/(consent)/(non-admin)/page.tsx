// react-doctor-disable-next-line react-doctor/nextjs-missing-metadata
"use client";

import { routes } from "@sd/core-contracts";
import { useRouter } from "next/navigation";

import { HomeScreen } from "@/features/home";

export default function HomePage() {
  const { push } = useRouter();

  return (
    <main className="flex flex-1 min-h-full flex-col">
      <HomeScreen
        onContinueListening={(listingSlug) => push(routes.listings.detail(listingSlug))}
      />
    </main>
  );
}
