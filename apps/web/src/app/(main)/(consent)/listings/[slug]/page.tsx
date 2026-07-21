import type { Metadata } from "next";
import { ListingDetailScreen } from "@/features/listing/screens/listing-detail/listing-detail.screen";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Content ${slug}`,
    description: "View content details.",
  };
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ListingDetailScreen slug={slug} />;
}
