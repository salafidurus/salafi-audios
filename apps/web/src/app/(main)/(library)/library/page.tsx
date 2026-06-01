import type { Metadata } from "next";
import { LibraryScreen } from "@/features/library/screens/library.screen";

export const metadata: Metadata = {
  title: "Library",
  description: "Your personal library of saved and completed lectures.",
};

export default function LibraryPage() {
  return <LibraryScreen />;
}
