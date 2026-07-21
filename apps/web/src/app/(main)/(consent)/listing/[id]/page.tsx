import type { Metadata } from "next";
import { ListingDetailScreen } from "@/features/listing/screens/listing-detail/listing-detail.screen";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Content ${id}`,
    description: "View content details.",
  };
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListingDetailScreen id={id} />;
}
