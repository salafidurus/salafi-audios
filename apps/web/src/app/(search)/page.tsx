import type { Metadata } from "next";
import { SearchHomeScreen } from "@sd/feature-search";

export const metadata: Metadata = {
  title: "Home",
  description: "Find a lesson in the Salafi Durus library.",
};

export default function HomePage() {
  return <SearchHomeScreen />;
}
