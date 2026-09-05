import { Suspense } from "react";

import SearchPageInner from "./search-page-inner";

/** Documents this module's responsibility and public boundary. */
/** Search page metadata for the public route and its query-driven results view. */
export const metadata = {
  title: "Search",
  description: "Search salafi durus by scholar, topic, or lecture",
};

/** Provides the suspense boundary required by the search URL parameters. */
export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}
