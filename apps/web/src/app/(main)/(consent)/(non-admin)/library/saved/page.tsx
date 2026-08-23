import type { Metadata } from "next";

import { LibrarySavedScreen } from "@/features/library";

export const metadata: Metadata = {
  title: "Saved",
  description: "Lessons saved for your personal study.",
};

export default function SavedLibraryPage() {
  return <LibrarySavedScreen />;
}
