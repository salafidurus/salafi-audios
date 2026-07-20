// react-doctor-disable-next-line react-doctor/nextjs-missing-metadata
"use client";

import { useRouter } from "next/navigation";
import { HomeScreen } from "@/features/home";
import { routes } from "@sd/core-contracts";

export default function HomePage() {
  const { push } = useRouter();

  return (
    <main className="flex flex-1 min-h-full flex-col">
      <HomeScreen
        onOpenSearch={() => push(routes.search)}
        onContinueListening={(lectureId) => push(routes.lectures.detail(lectureId))}
      />
    </main>
  );
}
