import type { Metadata } from "next";

import { Suspense } from "react";

import MyLibraryPageInner from "./my-library-page-inner";

/** Defines the authenticated library route. */
/** Supplies metadata for the saved, started, and completed content view. */
export const metadata: Metadata = {
  title: "My Library",
  description: "Continue, save, and review your Islamic lecture study.",
};

/** Renders the client-side library route inside a suspense boundary. */
export default function MyLibraryPage() {
  return (
    <Suspense fallback={null}>
      <MyLibraryPageInner />
    </Suspense>
  );
}
