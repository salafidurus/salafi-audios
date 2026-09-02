/** Documents this module's responsibility and public boundary. */
"use client";

import { useSearchParams } from "next/navigation";

import { SearchProcessingScreen } from "@/features/search";

export default function SearchPageInner() {
  const searchParams = useSearchParams();
  const searchKey = searchParams.get("searchKey") ?? undefined;
  const topicSlug = searchParams.get("topic") ?? undefined;

  return <SearchProcessingScreen searchKey={searchKey} topicSlug={topicSlug} />;
}
