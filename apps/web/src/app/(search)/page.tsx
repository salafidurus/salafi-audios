import type { Metadata } from "next";
import { SearchHomeResponsiveScreen } from "@sd/feature-search";

export const metadata: Metadata = {
  title: "Home",
  description: "Find a lesson in the Salafi Durus library.",
};

export default function HomePage() {
  return (
    <main className="flex flex-1 min-h-full flex-col">
      <SearchHomeResponsiveScreen />
    </main>
  );
}
