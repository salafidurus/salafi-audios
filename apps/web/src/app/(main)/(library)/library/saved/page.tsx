import type { Metadata } from "next";
import { LibrarySavedScreen } from "@/features/library";

export const metadata: Metadata = {
  title: "Saved Lectures",
  description: "Lectures you have saved for later.",
};

export default function LibrarySavedPage() {
  return <LibrarySavedScreen />;
}
