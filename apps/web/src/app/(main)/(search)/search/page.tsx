"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchProcessingResponsiveScreen } from "../../../../features/search/screens/search-processing/search-processing.screen";

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = searchParams.get("searchKey") ?? undefined;

  return (
    <SearchProcessingResponsiveScreen searchKey={searchKey} onBackPress={() => router.back()} />
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}
