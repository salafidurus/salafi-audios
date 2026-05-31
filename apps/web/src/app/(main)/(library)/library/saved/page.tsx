import type { Metadata } from "next";
import { LibrarySavedScreen } from "@/features/library/screens/library-saved.screen";

export const metadata: Metadata = {
  title: "Saved Lectures",
  description: "Lectures you have saved for later.",
};

export default function LibrarySavedPage() {
  return <LibrarySavedScreen />;
}
