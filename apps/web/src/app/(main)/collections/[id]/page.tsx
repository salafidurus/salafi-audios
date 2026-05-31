import type { Metadata } from "next";
import { ScreenInProgressResponsive } from "@/shared/components/ScreenInProgress/ScreenInProgress";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Collection ${id}`,
    description: "Browse lectures in this collection.",
  };
}

export default function CollectionPage() {
  return <ScreenInProgressResponsive />;
}
