import type { Metadata } from "next";
import { LibraryCompletedScreen } from "@/features/library/screens/library-completed.screen";

export const metadata: Metadata = {
  title: "Completed Lectures",
  description: "Lectures you have listened to and completed.",
};

export default function LibraryCompletedPage() {
  return <LibraryCompletedScreen />;
}
