import type { Metadata } from "next";
import { SearchProcessingScreen } from "@/features/search/screens/search-processing.screen";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Salafi Durus library.",
};

export default function SearchProcessingPage() {
  return <SearchProcessingScreen />;
}
