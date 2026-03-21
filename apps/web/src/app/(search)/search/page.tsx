import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchProcessingResponsiveScreen } from "@sd/feature-search";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Salafi Durus library.",
};

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchProcessingResponsiveScreen />
    </Suspense>
  );
}
