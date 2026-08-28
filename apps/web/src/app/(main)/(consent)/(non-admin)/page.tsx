// react-doctor-disable-next-line react-doctor/nextjs-missing-metadata
/** Hosts the public study landing page and its resume-listening entry point. */
"use client";

import { routes } from "@sd/core-contracts";
import { useRouter } from "next/navigation";

import { HomeScreen } from "@/features/home";

/** Hosts the public study landing page and routes resume actions to lecture details. */
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
