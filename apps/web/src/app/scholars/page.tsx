import type { Metadata } from "next";
import { ScholarsScreen } from "@/features/library/screens/scholars.screen";
import { canonical } from "@/features/library/utils/seo";

export const metadata: Metadata = {
  title: "Scholars",
  description: "Browse active scholars in the published Salafi Durus library.",
  alternates: {
    canonical: canonical("/scholars"),
  },
};

export default async function ScholarsPage() {
  return <ScholarsScreen />;
}
