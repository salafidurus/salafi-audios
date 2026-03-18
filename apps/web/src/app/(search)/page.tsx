import type { Metadata } from "next";
import { SearchHomeScreen } from "@/features/search/screens/search-home/search-home.screen";

export const metadata: Metadata = {
  title: "Home",
  description: "Find a lesson in the Salafi Durus library.",
};

export default function HomePage() {
  return <SearchHomeScreen />;
}
