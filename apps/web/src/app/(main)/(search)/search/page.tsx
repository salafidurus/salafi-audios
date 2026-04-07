"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchProcessingResponsiveScreen } from "@sd/feature-search";

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
