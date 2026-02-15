import type { Metadata } from "next";
import { getScholarsMetadata, ScholarsScreen } from "@/features/library/screens/scholars.screen";

export const metadata: Metadata = getScholarsMetadata();

export default async function ScholarsPage() {
  return <ScholarsScreen />;
}
