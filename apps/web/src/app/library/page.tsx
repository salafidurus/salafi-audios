import type { Metadata } from "next";
import { getLibraryMetadata, LibraryScreen } from "@/features/library/screens/library.screen";

export const metadata: Metadata = getLibraryMetadata();

export default function LibraryPage() {
  return <LibraryScreen />;
}
