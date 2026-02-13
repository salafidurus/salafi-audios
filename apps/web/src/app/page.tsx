import type { Metadata } from "next";
import { getHomeMetadata, HomeScreen } from "@/features/catalog/screens/home.screen";

export const metadata: Metadata = getHomeMetadata();

export default async function HomePage() {
  return <HomeScreen />;
}
