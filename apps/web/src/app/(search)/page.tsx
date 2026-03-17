import type { Metadata } from "next";
import { SearchLandingScreen } from "@/features/search/screens/search-landing.screen";

export const metadata: Metadata = {
  title: "Home",
  description: "Find a lesson in the Salafi Durus library.",
};

export default function HomePage() {
  return <SearchLandingScreen />;
}
