import type { Metadata } from "next";

import { Suspense } from "react";

import MyLibraryPageInner from "./my-library-page-inner";

export const metadata: Metadata = {
  title: "My Library",
  description: "Continue, save, and review your Islamic lecture study.",
};

export default function MyLibraryPage() {
  return (
    <Suspense fallback={null}>
      <MyLibraryPageInner />
    </Suspense>
  );
}
