import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/features/home/components/skeleton/skeleton";
import { getHomeMetadata, HomeScreen } from "@/features/home/screens/home.screen";

export const metadata: Metadata = getHomeMetadata();

export default async function HomePage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <HomeScreen />
    </Suspense>
  );
}
