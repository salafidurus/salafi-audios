import type { Metadata } from "next";

import { LibraryCompletedScreen } from "@/features/library";

export const metadata: Metadata = {
  title: "Completed",
  description: "Lessons completed during your personal study.",
};

export default function CompletedLibraryPage() {
  return <LibraryCompletedScreen />;
}
