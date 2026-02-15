import type { Metadata } from "next";
import {
  CollectionDetailScreen,
  getCollectionMetadata,
} from "@/features/library/screens/collection-detail.screen";

type CollectionPageProps = {
  params: { scholarSlug: string; collectionSlug: string };
};

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  return getCollectionMetadata({ params: Promise.resolve(params) });
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  return <CollectionDetailScreen params={Promise.resolve(params)} />;
}
