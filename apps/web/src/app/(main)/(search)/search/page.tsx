// react-doctor-disable-next-line react-doctor/nextjs-missing-metadata
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchProcessingScreen } from "@/features/search/screens/search-processing/search-processing.screen";

function SearchPageInner() {
  const searchParams = useSearchParams();
  const searchKey = searchParams.get("searchKey") ?? undefined;

  return <SearchProcessingScreen searchKey={searchKey} />;
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}
