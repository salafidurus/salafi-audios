import type { Metadata } from "next";
import {
  getSeriesMetadata,
  SeriesDetailScreen,
} from "@/features/library/screens/series-detail.screen";

type SeriesPageProps = {
  params: { scholarSlug: string; seriesSlug: string };
};

export async function generateMetadata({ params }: SeriesPageProps): Promise<Metadata> {
  return getSeriesMetadata({ params: Promise.resolve(params) });
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  return <SeriesDetailScreen params={Promise.resolve(params)} />;
}
