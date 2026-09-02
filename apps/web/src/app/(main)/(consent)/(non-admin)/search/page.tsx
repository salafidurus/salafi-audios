import { Suspense } from "react";

import SearchPageInner from "./search-page-inner";

/** Documents this module's responsibility and public boundary. */
export const metadata = {
  title: "Search",
  description: "Search salafi durus by scholar, topic, or lecture",
};

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}
